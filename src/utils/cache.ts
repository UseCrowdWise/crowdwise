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
  // const cacheRes = await cache.get(url);
  // if (cacheRes === undefined) {
  log.debug(`URL ${url} NOT found in cache!`);
  const res = await callApi(url, isJson);
  log.debug(
    `URL ${url} data fetched and storing in cache for duration: ${JSON.stringify(
      duration
    )}!`
  );
  // cache.set(url, res, duration);
  log.debug(
    `URL ${url} data stored in cache for duration: ${JSON.stringify(duration)}!`
  );
  return res;
  // } else {
  //   // Data is in cache and not expired
  //   const res = await cache.get(url);
  //   log.debug(`URL ${url} found in cache!`);
  //   return res;
  // }
}

export { type TimeDescriptor };
