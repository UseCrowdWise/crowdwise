import { fetchDataFromProviders } from "../providers/providers";

/**
 * BACKGROUND SCRIPT.
 *
 * A single instance of this script runs when the browser is active.
 * Receives messages from content scripts and actually makes the requests to provider APIs.
 *
 * Background script is the bottleneck because it doesn't have to deal with CORS issues.
 * See: https://www.chromium.org/Home/chromium-security/extension-content-script-fetches
 * */

/**
 * Respond every time a tab is updated in some way.
 * Specifically used to tell content scripts that the URL has changed without a full page reload.
 * For instance, routing within a single-page app.
 * */
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // If a tab's URL is updated, send a message to that tab so the content script can update.
  if (changeInfo.url) {
    console.log(
      `Background script: Url updated: tabId: ${tabId}, changeInfo: ${JSON.stringify(
        changeInfo
      )}, tab: ${JSON.stringify(tab)}`
    );
    chrome.tabs.sendMessage(tabId, {
      message: "tabUrlChanged",
      url: changeInfo.url,
    });
  }
});

/**
 * Handle messages from chrome tabs.
 * */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  handleOnMessage(request, sender).then(sendResponse);
});

async function handleOnMessage(request: any, sender: any) {
  console.log("Background script received message...");
  console.log(
    sender.tab
      ? "from a content script at tab URL:" + sender.tab.url
      : "from the extension"
  );
  // Received from a tab (content script)
  if (sender.tab) {
    // Ask providers for any relevant posts/comments
    const data = await fetchDataFromProviders(request.windowUrl);
    console.log("Printing provider data...");
    console.log(data);
    return data;
  }
  return {};
}

// After all listeners are registered
console.log("Background script initialized!");
