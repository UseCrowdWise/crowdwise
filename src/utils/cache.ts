/**
 * Handles in-memory caching, especially fetch API calls
 * */

import { callApi } from "./api";
import { log } from "../utils/log";
import toMilliseconds, { TimeDescriptor } from "@sindresorhus/to-milliseconds";

// https://www.npmjs.com/package/webext-storage-cache
// import cache from 'webext-storage-cache';

/**
 * Creates a cached version of the callApi function with time-based caching applied.
 * Different providers can choose different cache timings depending on when they expect their data to go stale.
 * */
// export function generateCachedApiCall(duration: TimeDescriptor) {
//   return cache.function(callApi, {
//     maxAge: duration,
//     cacheKey: (args: any) => args.join(','),
//   });
// }

export async function cachedApiCall(
  url: string,
  isJson: boolean = true,
  durationSec: number
) {
  const cacheRes = await readFromCache(url);
  if (cacheRes === undefined) {
    log.debug(`URL ${url} NOT found in cache!`);
    const res = await callApi(url, isJson);
    log.debug(
      `URL ${url} data fetched and storing in cache for duration: ${JSON.stringify(
        durationSec
      )} seconds!`
    );
    // TODO duration
    await writeToCache(url, res, durationSec);
    log.debug(
      `URL ${url} data stored in cache for duration: ${JSON.stringify(
        durationSec
      )} seconds!`
    );
    return res;
  } else {
    // Data is in cache and not expired
    log.debug(`URL ${url} found in cache!`);
    return cacheRes;
  }
}

/**
 * Get data for associated URL from cache, and removes the object if it expired.
 * */
export function readFromCache(key: string) {
  log.debug(`Cache reading key ${key}`);
  return new Promise<any>((resolve, reject) => {
    chrome.storage.local.get(key, function (result) {
      log.debug(`Cache reading complete!`);
      const res = result[key];
      if (res === undefined) {
        resolve(res);
      } else {
        if (isExpiredCacheEntry(res)) {
          log.warn("Cache value is expired!");
          chrome.storage.local.remove(key, () => resolve(undefined));
        } else {
          resolve(res.data);
        }
      }
    });
  });
}

/**
 * Write data for associated URL to cache.
 * */
export function writeToCache(key: string, value: any, durationSec: number) {
  log.debug(`Cache writing key ${key}`);
  // TODO create a type for this
  const now = new Date().valueOf();
  const cacheData = { data: value, cachedTime: now, maxDuration: durationSec };
  return new Promise<void>((resolve, reject) => {
    chrome.storage.local.set({ [key]: cacheData }, function () {
      log.debug(`Cache writing complete!`);
      resolve();
    });
  });
}

export function isExpiredCacheEntry(entry: any): boolean {
  const timeDiffSec = (new Date().valueOf() - entry.cachedTime) / 1000;
  log.debug(
    `Cache entry has been around for ${timeDiffSec} seconds, max allowed duration is ${entry.maxDuration}`
  );
  const isExpired = timeDiffSec > entry.maxDuration;
  return isExpired;
}

export { type TimeDescriptor };
