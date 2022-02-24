import { useEffect, useState } from "react";
import { ProviderResults, ProviderResultType } from "./providers";
import { log } from "../utils/log";
import {
  KEY_INCOGNITO_MODE,
  DEFAULT_INCOGNITO_MODE,
} from "../shared/constants";
import { useChromeStorage } from "../shared/useChromeStorage";

export const useProvidersData = () => {
  const [providerData, setProviderData] = useState<ProviderResults>({
    resultType: ProviderResultType.Ok,
    hackerNews: [],
    reddit: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isIncognito, _] = useChromeStorage(KEY_INCOGNITO_MODE, false);
  const [hasFetchedDataForThisPage, setHasFetchedDataForThisPage] =
    useState<boolean>(false);

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
        setHasFetchedDataForThisPage(true);
      }
    );
  };

  // Toggle the side bar based on incoming message from further down in the component (close arrow)
  const handleMessage = (request: any, sender: any, sendResponse: any) => {
    log.debug("Content script received message that our tab's URL changed.");
    // If we have changed page, we haven't fetched data for it yet
    if (request.changedUrl) {
      setHasFetchedDataForThisPage(false);
      // Only automatically run updateProviderData if we are explicitly not incognito
      if (isIncognito !== null && !isIncognito) {
        updateProviderData();
      }
    }
  };

  // When sidebar loads for the first time, ask for discussion data from providers.
  // We don't pass our URL to the background script. The script know what URL our tab is.
  // This avoids race conditions.
  useEffect(() => {
    log.debug(`Current incognito state is ${isIncognito}`);
    // Add listener when component mounts
    chrome.runtime.onMessage.addListener(handleMessage);

    // If the incognito state is still loading, don't update provider data
    // NOTE: maybe bug if we load undefined at the start?
    if (isIncognito !== null && !isIncognito) {
      // Update provider info immediately at the start
      updateProviderData();
    } else {
      log.debug(`Not updating provider data: isIncognito is ${isIncognito}`);
    }

    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, [isIncognito]);

  // When it's loading
  const hasNoProviderData = isLoading
    ? null
    : providerData.hackerNews.length === 0 && providerData.reddit.length === 0;

  return {
    isLoading,
    isIncognito,
    hasFetchedDataForThisPage,
    hasNoProviderData,
    providerData,
    updateProviderData,
  };
};
