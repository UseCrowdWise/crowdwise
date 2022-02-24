import { fetchDataFromProviders } from "../../providers/providers";
import { log } from "../../utils/log";
import { isExpiredCacheEntry } from "../../utils/cache";
import {
  CACHE_CLEAR_URL_ALARM_INTERVAL_MIN,
  CACHE_CLEAR_TABID_ALARM_INTERVAL_MIN,
  CACHE_CLEAR_URL_ALARM_NAME,
  CACHE_CLEAR_TABID_ALARM_NAME,
  KEY_SIDEBAR_OPEN_TAB_STATE,
} from "../../shared/constants";
/**
 * BACKGROUND SCRIPT.
 *
 * A single instance of this script runs when the browser is active.
 * Receives messages from content scripts and actually makes the requests to provider APIs.
 *
 * Background script is the bottleneck because it doesn't have to deal with CORS issues.
 * See: https://www.chromium.org/Home/chromium-security/extension-content-script-fetches
 * */

// Add cache clearing alarm
chrome.runtime.onInstalled.addListener(() => {
  log.debug("background script onInstalled...");
  // create alarm after extension is installed / upgraded
  chrome.alarms.create(CACHE_CLEAR_URL_ALARM_NAME, {
    delayInMinutes: 1,
    periodInMinutes: CACHE_CLEAR_URL_ALARM_INTERVAL_MIN,
  });
  chrome.alarms.create(CACHE_CLEAR_TABID_ALARM_NAME, {
    delayInMinutes: 2, // offset a little to make logs easier to read
    periodInMinutes: CACHE_CLEAR_TABID_ALARM_INTERVAL_MIN,
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === CACHE_CLEAR_URL_ALARM_NAME) {
    // Remove data from URL fetches that we cached
    removeExpiredCacheEntries();
  } else if (alarm.name === CACHE_CLEAR_TABID_ALARM_NAME) {
    // Remove tabId preference information (open/closed)
    // Many of these tabs will not exist.
    // TODO bit of a callback hell at the moment
    log.debug("Running tab id cache clearning alarm.");
    chrome.tabs.query({}, function (tabs) {
      log.debug("Got all active tabs..");
      log.debug(tabs);
      const tabIdKeyStrings = tabs.map(
        (t) => `${KEY_SIDEBAR_OPEN_TAB_STATE}${t.id}`
      );
      log.debug(`TabID key strings: ${tabIdKeyStrings}`);
      // Get all keys in local storage and remove invalid tab states
      chrome.storage.local.get(null, (items) => {
        log.debug("Local storage items:");
        log.debug(items);
        const invalidKeys = Object.keys(items).filter(
          (key) =>
            key.startsWith(KEY_SIDEBAR_OPEN_TAB_STATE) &&
            tabIdKeyStrings.indexOf(key) < 0
        );
        chrome.storage.local.remove(invalidKeys, () => {
          log.debug(
            `Removed ${invalidKeys.length} invalid tabId states from cache!`
          );
          log.debug(invalidKeys);
        });
      });
    });
  }
});

// Clear all expired cache entries
function removeExpiredCacheEntries() {
  log.warn("Clearing cache of expired entries.");
  chrome.storage.local.get(null, (results) => {
    let keysToRemove = [];
    Object.keys(results).forEach((key) => {
      const localStorageVal = results[key];
      // log.debug("Local storage value:");
      // log.debug(localStorageVal);
      // Check for expiry and add it to the list of keys to remove if so
      if (localStorageVal.cachedTime) {
        if (isExpiredCacheEntry(localStorageVal)) keysToRemove.push(key);
      }
    });
    log.debug(`Initiating removal of ${keysToRemove.length} entries...`);
    chrome.storage.local.remove(keysToRemove, () => {
      log.debug("Removed all expired entries!");
    });
  });
}

/**
 * Respond every time a tab is updated in some way.
 * Specifically used to tell content scripts that the URL has changed without a full page reload occuring.
 * For instance, routing within a single-page app.
 * */
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // If a tab's URL is updated, send a message to that tab so the content script can update.
  if (changeInfo.url) {
    log.debug(
      `Background script: Url updated: tabId: ${tabId}, changeInfo: ${JSON.stringify(
        changeInfo
      )}, tab: ${JSON.stringify(tab)}`
    );
    chrome.tabs.sendMessage(tabId, {
      changedUrl: changeInfo.url,
    });
  }
});

/**
 * Handle provider data request from content script.
 * Passes information to handleOnMessage
 * */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  handleOnMessage(request, sender).then((data) => {
    log.debug("Sending response data to content script: ");
    log.debug(data);
    sendResponse(data);
  });
  return true;
});

async function handleOnMessage(request, sender) {
  log.debug("Background script received message...");
  log.debug(
    sender.tab
      ? "from a content script at tab URL:" + sender.tab.url
      : "NOT from a tab"
  );
  // Received from a tab (content script)
  if (sender.tab) {
    if (request.getProviderData) {
      // Ask providers for any relevant posts/comments
      const data = await fetchDataFromProviders(sender.tab.url);
      log.debug("Background script: printing provider data...");
      log.debug(data);
      return data;
    } else if (request.getTabId) {
      // Tab wants to know if it should be open or closed (last open/close action by the user in this tab)
      return sender.tab.id;
    }
  }
  return {};
}

// After all listeners are registered
log.debug("Background script initialized!");
