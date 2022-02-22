/**
 * Handles in-memory caching, especially fetch API calls
 * */

import { callApi } from './api';
import { log } from '../utils/log';
import toMilliseconds, { TimeDescriptor } from '@sindresorhus/to-milliseconds';

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
  duration: TimeDescriptor
) {
  const cacheRes = await readCache(url);
  if (cacheRes === undefined) {
    log.debug(`URL ${url} NOT found in cache!`);
    const res = await callApi(url, isJson);
    log.debug(
      `URL ${url} data fetched and storing in cache for duration: ${JSON.stringify(
        duration
      )}!`
    );
    // TODO duration
    await writeCache(url, res);
    log.debug(
      `URL ${url} data stored in cache for duration: ${JSON.stringify(duration)}!`
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
export function readCache(key: string) {
  log.debug(`Cache reading key ${key}`)
  return new Promise<any>((resolve, reject) => {
    chrome.storage.local.get(key, function (result) {
        log.debug(`Cache reading complete!`)
        resolve(result[key]);
    });
  });
}

/**
 * Get data for associated URL from cache, and removes the object if it expired.
 * */
export function writeCache(key: string, value: any) {
  log.debug(`Cache writing key ${key}`)
  return new Promise<void>((resolve, reject) => {
    chrome.storage.local.set({[key]: value}, function () {
      log.debug(`Cache writing complete!`)
      resolve();
    });
  });
}


export { type TimeDescriptor };
