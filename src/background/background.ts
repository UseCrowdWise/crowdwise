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

export {};
