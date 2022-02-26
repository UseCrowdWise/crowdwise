import { log } from "./log";

export const sendMessageToActiveTab = (message: Record<string, any>) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, message);
    }
  });
};

/**
 * For Sidebar to send messages to index without sending message to wrong tab (possibly if user switches tabs quickly)
 * */
export const sendMessageToCurrentTab = (message: Record<string, any>) => {
  chrome.tabs.getCurrent((tab?: chrome.tabs.Tab) => {
    if (tab !== undefined && tab.id) {
      chrome.tabs.sendMessage(tab.id, message);
    } else {
      log.error(
        `Tried to call sendMessageToCurrentTab from something that doesn't have a tab id, with message ${message}. Please report this bug.`
      );
    }
  });
};
