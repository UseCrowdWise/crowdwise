// Some code used from https://github.com/benwinding/newsit/
// Fetches data from multiple providers given a base URL
// import { cleanUrl } from 'tracking-params';
import _ from "lodash";

import { log } from "../utils/log";
import { isBlacklisted } from "./blacklist";
import { HnResultProvider } from "./hackernews";
import { RedditResultProvider } from "./reddit";

// All providers must implement these two functions for search
export interface ResultProvider {
  getProviderName(): string;
  getExactUrlResults(url: string): Promise<SingleProviderResults>;
  getSiteUrlResults(url: string): Promise<SingleProviderResults>;
  getTitleResults(title: string): Promise<SingleProviderResults>;
}

// To indicate inside the result structure, so we know where in the UI to place it
export enum ProviderQueryType {
  EXACT_URL = "ExactUrl",
  SITE_URL = "SiteUrl",
  TITLE = "Title",
}

// A list of results from a provider call should have this form
// NOTE: if we ever change the names "providerName" or "queryType"
//  we need to update the _.groupBy calls at the bottom (those use strings).
export interface SingleProviderResults {
  providerName: string;
  queryType: ProviderQueryType;
  results: ResultItem[];
}

// All providers must return a list of resultitems
export interface ResultItem {
  rawHtml?: string;
  // NOTE: If we change submittedUrl name, we need to update the de-duplication code
  submittedUrl: string;
  submittedDate: string;
  submittedUpvotes: number;
  submittedTitle: string;
  submittedBy: string;
  submittedByLink: string;
  commentsCount: number;
  commentsLink: string;
  // Name of the source within the provider for this info
  // E.g., subreddit name for reddit
  subSourceName: string;
  // Link to the source within the provider
  // E.g., subreddit link for reddit
  subSourceLink: string;
}

// General status of results
export enum ProviderResultType {
  Ok = "OK",
  Blacklisted = "BLACKLISTED",
}

// Query that produced provider results
export interface QueryInfo {
  searchExactUrl: string;
  searchSiteUrl: string;
  searchTitle: string;
}

// We should probably define an enum, but can be deferred for now
type ProviderName = string;
// This is the format that the sidebar wants
export interface AllProviderResults {
  queryInfo: QueryInfo;
  // Success / failure indication
  resultType: ProviderResultType;
  // Have to use a lodash dict because Typescript cannot infer it's a normal record?
  // Dictionary is just Dictionary<T> {  [index: string]: T; }
  providerResults: {
    [key: ProviderName]: _.Dictionary<ResultItem[]>;
  };
  // Pre-compute this for consumers since it's annoying to traverse the providerResults structure
  numResults: number;
  // For notifications: in case we only notify / do UI on exact results.
  numExactResults: number;
}

// Init all providers
const reddit = new RedditResultProvider();
const hackernews = new HnResultProvider();

// Build a data structure of all providers so we can do things programmatically
const providers: ResultProvider[] = [reddit, hackernews];

/**
 * Main entry point for content script to get provider data.
 * Parses the raw window location URL and collates conversation data across multiple providers.
 * */
export async function fetchDataFromProviders(
  rawUrl: string,
  documentTitle: string
): Promise<AllProviderResults> {
  log.debug("Starting to fetch provider data.");

  // Get just the site from the URL for a wider search.
  const siteUrl = new URL(rawUrl).hostname;
  log.debug(`Site URL: ${siteUrl}`);

  // Remove tracking params that are definitely not relevant to the site URL
  const trackingCleanedUrl = rawUrl; // cleanUrl(rawUrl);
  log.debug(
    `Dirty URL: ${rawUrl}\nTracking Cleaned URL: ${trackingCleanedUrl}`
  );

  // Remove fragment identifier ("#") at the end of a URL
  // Think google slides slide identifier, google text highlighting, TOC navigation etc
  // Fragments indicate that we're on the same page, just a different section
  const noFragmentUrl = trackingCleanedUrl.replace(/#.*$/, "");
  log.debug(
    `Tracking cleaned URL ${trackingCleanedUrl}\nNo fragment URL: ${noFragmentUrl}`
  );

  // Remove http, https, www, and trailing slash
  let cleanedUrl = noFragmentUrl.replace(/^https?:\/\//, "");
  cleanedUrl = cleanedUrl.replace(/www\./, "");
  cleanedUrl = cleanedUrl.replace(/\/$/, "");
  log.debug(
    `No fragment URL ${noFragmentUrl}\nFINAL Cleaned URL: ${cleanedUrl}`
  );

  const queryInfo = {
    searchExactUrl: cleanedUrl,
    searchSiteUrl: siteUrl,
    searchTitle: documentTitle,
  };

  // Return early if this URL is blacklisted
  if (isBlacklisted(cleanedUrl) || isBlacklisted(siteUrl)) {
    log.warn(`URL ${cleanedUrl} or ${siteUrl} is blacklisted!`);
    return {
      resultType: ProviderResultType.Blacklisted,
      queryInfo,
      providerResults: {},
      numResults: 0,
      numExactResults: 0,
    };
  }

  log.debug(`URL ${cleanedUrl} is NOT blacklisted!`);

  // Gather all the promises from all the providers
  // TODO if this order of calls changes, have to update the mapping function below
  const providerPromises: Promise<SingleProviderResults>[] = providers
    .map((provider) => [
      provider.getExactUrlResults(cleanedUrl),
      provider.getSiteUrlResults(siteUrl),
      provider.getTitleResults(documentTitle),
    ])
    .flat();

  // Run them all concurrently and don't die early if one of the calls fails.
  const allProviderPromiseResults: PromiseSettledResult<SingleProviderResults>[] =
    await Promise.allSettled(providerPromises);

  // Process the results (depends on whether promises were accepted or rejected
  const allResults: SingleProviderResults[] = allProviderPromiseResults
    .map(
      (providerPromiseResult: PromiseSettledResult<SingleProviderResults>) => {
        if (providerPromiseResult.status === "rejected") {
          log.error(
            `Provider result rejected, reason: ${providerPromiseResult.reason}`
          );
          return undefined;
        } else {
          const result: SingleProviderResults = providerPromiseResult.value;
          return result;
        }
      }
    )
    .filter((result) => result !== undefined) as SingleProviderResults[];

  // Group the results in a way that the sidebar can use
  // Group first by the provider name, and then by the query type
  const providerResults = _.mapValues(
    _.groupBy(allResults, "providerName"),
    (v, k) => _.mapValues(_.groupBy(v, "queryType"), (spr) => spr[0].results)
  );

  // De-duplicate here
  // Idea: for each /provider/, we want to make sure there are no duplicate results
  // Prioritize keeping results in the order of the query types, so should be exact match > site > title for now.
  // That is, if exact match and site have duplicates, the site duplicates are removed first.
  Object.keys(providerResults).forEach((providerName: ProviderName) => {
    // Don't filter ACROSS providers, just across query types
    const thisProviderResults = providerResults[providerName];
    const thisProviderQueryTypes = Object.keys(thisProviderResults);
    // For each query type, "subtract" the results from the other query type results
    thisProviderQueryTypes.forEach((queryType: string, idx: number) => {
      // Get all other query types further down the list
      const thisProviderRestQueryTypes = thisProviderQueryTypes.slice(idx + 1);
      // Get the current provider query's results, so that we can subtract it from the other query results
      const thisProviderQueryResults = thisProviderResults[queryType];
      thisProviderRestQueryTypes.forEach((otherQueryType: string) => {
        const otherQueryResults = thisProviderResults[otherQueryType];
        const dedupedQueryResults = _.differenceBy(
          otherQueryResults,
          thisProviderQueryResults,
          "submittedUrl"
        );
        thisProviderResults[otherQueryType] = dedupedQueryResults;
      });
    });
  });

  // Little complicate to compute num results since we have to iterate through two object key layers
  let numResults = 0;
  let numExactResults = 0;
  _.forEach(providerResults, (queryResults) =>
    _.forEach(queryResults, (results, queryType) => {
      numResults += results.length;
      if (queryType === ProviderQueryType.EXACT_URL) {
        numExactResults += results.length;
      }
    })
  );

  return {
    resultType: ProviderResultType.Ok,
    queryInfo,
    providerResults,
    numResults,
    numExactResults,
  };
}
