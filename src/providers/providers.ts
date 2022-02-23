// Some code used from https://github.com/benwinding/newsit/

// Fetches data from multiple providers given a base URL
// import { cleanUrl } from 'tracking-params';

import * as hackernews from './hackernews';
import * as reddit from './reddit';
import { isBlacklisted } from './blacklist';

import { log } from '../utils/log';

// All providers must return a list of resultitems
export interface ResultItem {
  raw_html?: string;
  submitted_url: string;
  submitted_date: string;
  submitted_upvotes: number;
  submitted_title: string;
  submitted_by: string;
  submitted_by_link: string;
  comments_count: number;
  comments_link: string;
  // Name of the source within the provider for this info
  // E.g., subreddit name for reddit
  sub_source_name: string;
  // Link to the source within the provider
  // E.g., subreddit link for reddit
  sub_source_link: string;
}

export enum ProviderResultType {
  Ok = 'OK',
  Blacklisted = 'BLACKLISTED',
}

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
  log.debug('Starting to fetch provider data.');

  // Remove tracking params that are definitely not relevant to the site URL
  const trackingCleanedUrl = rawUrl; // cleanUrl(rawUrl);
  log.debug(`Dirty URL: ${rawUrl}\nTracking Cleaned URL: ${trackingCleanedUrl}`);

  // Remove http, https, www
  let cleanedUrl  = trackingCleanedUrl.replace(/^https?:\/\//, "")
  cleanedUrl  = cleanedUrl.replace(/www\./, "")
  log.debug(`Tracking cleaned URL ${trackingCleanedUrl}\nFINAL Cleaned URL: ${cleanedUrl}`);

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
  log.debug('HN results:');
  log.debug(hnResults);

  const redditResults = await reddit.getResults(cleanedUrl);
  log.debug('Reddit results:');
  log.debug(redditResults);

  return {
    resultType: ProviderResultType.Ok,
    hackerNews: hnResults,
    reddit: redditResults,
  };
}
