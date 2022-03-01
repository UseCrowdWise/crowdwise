// Some code used from https://github.com/benwinding/newsit/
// Fetches data from multiple providers given a base URL
// import { cleanUrl } from 'tracking-params';
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
export interface SingleProviderResults {
  providerName: string;
  queryType: ProviderQueryType;
  results: ResultItem[];
}

// All providers must return a list of resultitems
export interface ResultItem {
  rawHtml?: string;
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
// export const Providers = {[PROVIDER_HN_NAME]: {}}

// NOTE: if we add more providers, remember to update code that adds the length of these together
//  to get total result counts.
export interface AllProviderResults {
  resultType: ProviderResultType;
  providerResults: SingleProviderResults[];
  // hackerNews: ResultItem[];
  // reddit: ResultItem[];
}

// Initialize all providers
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

  // Remove http, https, www
  let cleanedUrl = noFragmentUrl.replace(/^https?:\/\//, "");
  cleanedUrl = cleanedUrl.replace(/www\./, "");
  log.debug(
    `No fragment URL ${noFragmentUrl}\nFINAL Cleaned URL: ${cleanedUrl}`
  );

  // Return early if this URL is blacklisted
  if (isBlacklisted(cleanedUrl) || isBlacklisted(siteUrl)) {
    log.warn(`URL ${cleanedUrl} or ${siteUrl} is blacklisted!`);
    return {
      resultType: ProviderResultType.Blacklisted,
      providerResults: [],
    };
  }

  log.debug(`URL ${cleanedUrl} is NOT blacklisted!`);

  // Construct results
  // const providers = [hackernews, reddit]
  // const [hnExactResults, hnSiteResults, hnTitleResults, redditExactResults, redditSiteResults, reddit]= hackernews.getUrlResults(cleanedUrl);

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

  // We could have this be a constant, but this way we don't have to change it as we add more calls per provider.
  const resultsPerProvider = providerPromises.length / providers.length;
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

  // Call each provider in turn
  // const hnResults = await hackernews.getExactUrlResults(cleanedUrl);
  // log.debug("HN results:");
  // log.debug(hnResults);

  // const redditResults = await reddit.getExactUrlResults(cleanedUrl);
  // log.debug("Reddit results:");
  // log.debug(redditResults);

  // TODO MUST DEDUPLICATE!

  return {
    resultType: ProviderResultType.Ok,
    providerResults: allResults,
  };
}
