/**
 * Processes incoming URLs and removes those that are blacklisted.
 *
 * This call is on the hotpath so we need to be efficient.
 *
 * We'll have three kind of blacklist URLs:
 *  1. Full hostname blacklist: the entire hostname must match to be rejected
 *    --> we can use a set to match the list of hostnames against our incoming URL's hostname.
 *    Reasoning based on ECMAScript requirements for Set implementations:
 *      "Set objects must be implemented using either hash tables or other mechanisms that,
 *      on average, provide access times that are ****sublinear**** on the number of elements in the collection."
 *
 *  2. Full URL blacklist: match on the entire URL  - we can use the same approach.
 *
 *  3. Subdomain match: *.x.y.z: any subdomains of x.y.z must be rejected.
 *    --> This is a little trickier since we can't just match on a set 1 - 1 for all subdomains.
 *        One solution: for each subdomain we add to the blacklist, we put them into a set depending on the number of subdomains in the unblocked part.
 *          For e.g., *.x.y.z goes into a subdomain blocklist of order 3, and *.facebook.com will go into one of order 2.
 *             E.g.: subdomain_blocklists = { 2: Set["facebook.com"], 3: Set(["x.y.z"]) }
 *         Then, we split the hostname into parts, and match subsets of it against each set.
 *
 * Problems
 *   1. The blacklist has to be stored in chrome.storage.sync but:
 *     - the user rarely modifies this
 *     - accessing it on each blacklisted call will incur an async penalty
 *     - we can't cache it locally since service workers are not persistent
 *
 * */
import { createChromeStorageStateHookSync } from "../shared/storage/index";
import { log } from "../utils/log";

// Constants
export const BLACKLIST_STORAGE_KEY = "user-blacklist";
export const emptyBlacklist: StorageBlacklist = {
  hostnames: [],
  fullUrls: [],
  subdomains: [],
};
export const testBlacklist: StorageBlacklist = {
  hostnames: ["www.facebook.com"],
  fullUrls: ["asdf-vm.com/manage/core.html"],
  subdomains: ["asdf-vm.com"],
};

// Chrome storage hook for react
export const useBlacklistSettingsStore = createChromeStorageStateHookSync(
  BLACKLIST_STORAGE_KEY,
  testBlacklist
);

export interface LocalBlacklist {
  hostnames: Set<string>;
  fullUrls: Set<string>;
  subdomains: LocalSubdomainMap;
}
export interface LocalSubdomainMap {
  [numDomains: number]: Set<string>;
}
export type StorageSubdomainMap = string[];
export interface StorageBlacklist {
  hostnames: string[];
  fullUrls: string[];
  subdomains: StorageSubdomainMap;
}

// Convert from storage version of subdomain list to local subdomain map
export const subdomainsAsListToMap = (
  subdomains: StorageSubdomainMap
): LocalSubdomainMap => {
  log.debug("Subdomains in subdomainsAsListToMap:");
  log.debug(subdomains);
  let output: LocalSubdomainMap = {};
  subdomains.forEach((subdomain: string) => {
    log.debug("processing subdomain");
    log.debug(subdomain);
    // Each of the format x.y.z
    const subdomainSize = subdomain.split(".").length;
    if (output[subdomainSize] && !output[subdomainSize].has(subdomain)) {
      output[subdomainSize].add(subdomain);
    } else {
      output[subdomainSize] = new Set([subdomain]);
    }
  });

  return output;
};

// Full conversion function from chrome storage to local
// Necessary since we can't store sets, has to be serializable
const convertStorageToLocalBlacklist = (
  sbl: StorageBlacklist
): LocalBlacklist => {
  return {
    hostnames: new Set(sbl.hostnames),
    fullUrls: new Set(sbl.fullUrls),
    subdomains: subdomainsAsListToMap(sbl.subdomains),
  };
};

// Start with blacklist undefined
let blacklist: LocalBlacklist | undefined =
  convertStorageToLocalBlacklist(testBlacklist);

// Try to keep blacklist updated through listening to the chrome storage API
const blacklistChangedListener = (changes: any, areaName: string) => {
  if (areaName === "sync" && BLACKLIST_STORAGE_KEY in changes) {
    log.debug("Blacklist changed, new blacklist is:");
    log.debug(changes[BLACKLIST_STORAGE_KEY].newValue);
    blacklist = convertStorageToLocalBlacklist(
      changes[BLACKLIST_STORAGE_KEY].newValue
    );
  }
};

// Register the listener for blacklist changes
// Hopefully this will keep this code alive, but probably not
if (!chrome.storage.onChanged.hasListener(blacklistChangedListener)) {
  chrome.storage.onChanged.addListener(blacklistChangedListener);
}

async function updateBlacklist(): Promise<void> {
  return new Promise((resolve, reject) => {
    const callback = async (result: any) => {
      const storageBlacklist = convertStorageToLocalBlacklist(
        result[BLACKLIST_STORAGE_KEY] ?? emptyBlacklist
      );
      log.debug(`Got blacklist: `);
      log.debug(storageBlacklist);
      blacklist = storageBlacklist;
      resolve();
    };

    chrome.storage.sync.get([BLACKLIST_STORAGE_KEY], callback);
  });
}

/**
 * Indicates if a URL is blacklisted by the user.
 * */
export async function isBlacklisted(urlstr: string): Promise<boolean> {
  const url = new URL(urlstr);
  log.debug("Checking blacklist status for URL:");
  log.debug(url);
  const hostname = url.hostname; // e.g., www.npmjs.com
  if (!blacklist) {
    log.debug("Updating blacklist");
    await updateBlacklist();
  }

  log.debug("Blacklist:");
  log.debug(blacklist);
  log.debug("Checking all hostnames");

  // Check through all blacklists
  // 1. Exact hostname blacklist
  if (blacklist?.hostnames.has(hostname)) {
    log.debug(`Current URL hostname ${hostname} is in blacklist`);
    return true;
  }

  // 2. Check exact urls
  if (blacklist?.fullUrls.has(url.hostname + url.pathname)) {
    log.debug(`Current full URL ${url.href} is in blacklist`);
    return true;
  }

  // 3. Check subdomains
  const hostnameSplit = hostname.split(".");
  //@ts-ignore
  for (const key in blacklist?.subdomains ?? {}) {
    const subdomainBlacklist = blacklist!.subdomains[key];
    // ["x", "y", "z"] ==> "y.z" (if key == 2)
    const subhostname = hostnameSplit.slice(-key).join(".");
    if (subdomainBlacklist.has(subhostname)) {
      log.debug(`Found subdomain ${subhostname} inside blacklist!`);
      return true;
    }
  }

  // If we pass all checks, return false
  return false;
}
