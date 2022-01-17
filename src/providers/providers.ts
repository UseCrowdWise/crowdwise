// Some code used from https://github.com/benwinding/newsit/

// Fetches data from multiple providers given a base URL
import { cleanUrl } from "tracking-params";

import * as hackernews from "./hackernews";
import * as reddit from "./reddit";
import { isBlacklisted } from "./blacklist";

import { log } from "../utils/log";

// All providers must return a list of resultitems
export interface ResultItem {
  raw_html?: string;
  submitted_url: string;
  submitted_date: string;
  submitted_upvotes: number;
  submitted_title: string;
  submitted_by: string;
  comments_count: number;
  comments_link: string;
}
export enum ProviderResultType {
  Ok = "OK",
  Blacklisted = "BLACKLISTED",
}
export interface ProviderResult {
  resultType: ProviderResultType;
  result: ResultItem[][]; // Array of ResultItem[], one from each provider
}

/**
 * Main entry point for content script to get provider data.
 * Parses the raw window location URL and collates conversation data across multiple providers.
 * */
export async function fetchDataFromProviders(
  rawUrl: string
): Promise<ProviderResult> {
  log.debug("Starting to fetch provider data.");

  // Remove tracking params that are definitely not relevant to the site URL
  const cleanedUrl = cleanUrl(rawUrl);
  log.debug(`Dirty URL: ${rawUrl}\nCleaned URL: ${cleanedUrl}`);

  // Return early if this URL is blacklisted
  if (isBlacklisted(cleanedUrl)) {
    log.warn(`URL ${cleanedUrl} is blacklisted!`);
    return { resultType: ProviderResultType.Blacklisted, result: [] };
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
    result: [hnResults, redditResults],
  };
}
