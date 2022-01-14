import { fetchDataFromProviders } from "../providers/providers";

console.log("Background script initialized!");

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

// Handle messages from chrome tabs
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
    const data = await fetchDataFromProviders(request.windowUrl);
    console.log("Printing provider data...");
    console.log(data);
    return data;
  }
  return {};
}

export {};
