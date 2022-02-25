// Some code used from https://github.com/benwinding/newsit/

// Fetches data from multiple providers given a base URL
// import { cleanUrl } from 'tracking-params';

import * as hackernews from "./hackernews";
import * as reddit from "./reddit";
import { isBlacklisted } from "./blacklist";

import { log } from "../utils/log";

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

export enum ProviderResultType {
  Ok = "OK",
  Blacklisted = "BLACKLISTED",
}

// NOTE: if we add more providers, remember to update code that adds the length of these together
//  to get total result counts.
export interface ProviderResults {
  resultType: ProviderResultType;
  hackerNews: ResultItem[];
  reddit: ResultItem[];
}

/**
 * Main entry point for content script to get provider data.
 * Parses the raw window location URL and collates conversation data across multiple providers.
 * */
export async function fetchDataFromProviders(
  rawUrl: string
): Promise<ProviderResults> {
  log.debug("Starting to fetch provider data.");

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
  if (isBlacklisted(cleanedUrl)) {
    log.warn(`URL ${cleanedUrl} is blacklisted!`);
    return {
      resultType: ProviderResultType.Blacklisted,
      hackerNews: [],
      reddit: [],
    };
  }

  log.debug(`URL ${cleanedUrl} is NOT blacklisted!`);

  // Call each provider in turn
  const hnResults = await hackernews.getResults(cleanedUrl);
  log.debug("HN results:");
  log.debug(hnResults);

  const redditResults = await reddit.getResults(cleanedUrl);
  log.debug("Reddit results:");
  log.debug(redditResults);

  return {
    resultType: ProviderResultType.Ok,
    hackerNews: hnResults,
    reddit: redditResults,
  };
}
