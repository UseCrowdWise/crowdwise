import { useEffect, useState } from "react";
import { ProviderResults, ProviderResultType } from "./providers";
import { log } from "../utils/log";

export const useProvidersData = () => {
  const [providerData, setProviderData] = useState<ProviderResults>({
    resultType: ProviderResultType.Ok,
    hackerNews: [],
    reddit: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Actual call to update current results
  const updateProviderData = () => {
    setIsLoading(true);
    log.debug("Sending message to background script to update provider info.");
    chrome.runtime.sendMessage(
      { getProviderData: true },
      (response: ProviderResults) => {
        setIsLoading(false);
        log.debug("Printing provider data from background script...");
        log.debug(response);
        setProviderData(response);
      }
    );
  };

  // Toggle the side bar based on incoming message from further down in the component (close arrow)
  const handleMessage = (request: any, sender: any, sendResponse: any) => {
    log.debug("Content script received message that our tab's URL changed.");
    if (request.changedUrl) {
      updateProviderData();
    }
  };

  // When sidebar loads for the first time, ask for discussion data from providers.
  // We don't pass our URL to the background script. The script know what URL our tab is.
  // This avoids race conditions.
  useEffect(() => {
    // Add listener when component mounts
    chrome.runtime.onMessage.addListener(handleMessage);

    // Update provider info immediately at the start
    updateProviderData();

    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  // When it's loading
  const hasNoProviderData = isLoading
    ? null
    : providerData.hackerNews.length === 0 && providerData.reddit.length === 0;

  return {
    isLoading,
    hasNoProviderData,
    providerData,
  };
};
