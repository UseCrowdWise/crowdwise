// Fetches data from multiple providers given a base URL
import { cleanUrl } from 'tracking-params'

/**
 * Main entry point for content script to get provider data.
 * Parses the raw window location URL and collates conversation data across multiple providers.
 * */
async function fetchDataFromProviders(rawUrl: string) {
    console.log("Starting to fetch provider data.")

    const cleanedUrl = cleanUrl(rawUrl);
    console.log(`Dirty URL: ${rawUrl}\nCleaned URL: ${cleanedUrl}`);
}

export { fetchDataFromProviders }
