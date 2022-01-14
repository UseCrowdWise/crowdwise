// Some code used from https://github.com/benwinding/newsit/

// Fetches data from multiple providers given a base URL
import { cleanUrl } from "tracking-params";

import * as hackernews from "./hackernews";

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

/**
 * Main entry point for content script to get provider data.
 * Parses the raw window location URL and collates conversation data across multiple providers.
 * */
async function fetchDataFromProviders(rawUrl: string) {
  console.log("Starting to fetch provider data.");

  // Remove tracking params that are definitely not relevant to the site URL
  const cleanedUrl = cleanUrl(rawUrl);
  console.log(`Dirty URL: ${rawUrl}\nCleaned URL: ${cleanedUrl}`);

  // URLencode the string so that the providers can search for it
  const encodedUrl = encodeURIComponent(cleanedUrl);

  // Call each provider in turn
  const hnresults = await hackernews.getResults(encodedUrl);
  console.log("HN results:");
  console.log(hnresults);
}

export { fetchDataFromProviders };
