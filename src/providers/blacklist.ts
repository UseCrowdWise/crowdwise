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
import { log } from "../utils/log";

// Constants
export const BLACKLIST_STORAGE_KEY = "user-blacklist";

export interface Blacklist {
  hostnames: Set<string>;
  fullUrls: Set<string>;
  subdomains: SubdomainMap;
}
export interface SubdomainMap {
  [numDomains: number]: Set<string>;
}

export const emptyBlacklist: Blacklist = {
  hostnames: new Set<string>(),
  fullUrls: new Set<string>(),
  subdomains: {},
};

export const testBlacklist: Blacklist = {
  hostnames: new Set<string>(["www.facebook.com"]),
  fullUrls: new Set<string>(["asdf-vm.com/manage/core.html"]),
  subdomains: { 2: new Set(["google.com"]) },
};

// Start with blacklist undefined
let blacklist: Blacklist | undefined = testBlacklist;

// Try to keep blacklist updated through listening to the chrome storage API
const blacklistChangedListener = (changes: any, areaName: string) => {
  if (areaName === "sync" && BLACKLIST_STORAGE_KEY in changes) {
    blacklist = changes[BLACKLIST_STORAGE_KEY].newValue;
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
      const storageBlacklist = result[BLACKLIST_STORAGE_KEY] ?? emptyBlacklist;
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
