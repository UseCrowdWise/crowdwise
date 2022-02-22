import { fetchDataFromProviders } from "../../providers/providers";
import { log } from "../../utils/log";
import { isExpiredCacheEntry } from "../../utils/cache";
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
  chrome.alarms.create("refresh_cache", {
    delayInMinutes: 1,
    periodInMinutes: 1,
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  removeExpiredCacheEntries();
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
    // Ask providers for any relevant posts/comments
    const data = await fetchDataFromProviders(sender.tab.url);
    log.debug("Background script: printing provider data...");
    log.debug(data);
    return data;
  }
  return {};
}

// After all listeners are registered
log.debug("Background script initialized!");
