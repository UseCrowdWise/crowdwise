import { useEffect, useState } from "react";
import { sendMessageToActiveTab } from "../utils/tabs";

export const useChromeStorage = (
  storageKey: string,
  defaultValue: any,
  loadingValue: any = null
) => {
  const [data, setData] = useState<any>(loadingValue);

  const setStorageData = (newData: any) => {
    const payload = {
      [storageKey]: newData,
    };
    chrome.storage.local.set(payload, () => sendMessageToActiveTab(payload));
  };

  const handleChange = (request: any, sender: any, sendResponse: any) => {
    const updatedData = request[storageKey];
    if (updatedData !== undefined) {
      setData(updatedData);
    }
  };

  useEffect(() => {
    chrome.storage.local.get([storageKey], (result) => {
      setData(result[storageKey] || defaultValue);
    });
  }, []);

  useEffect(() => {
    // Add listener when component mounts
    chrome.runtime.onMessage.addListener(handleChange);

    // Remove listener when this component unmounts
    return () => chrome.runtime.onMessage.removeListener(handleChange);
  }, []);

  return [data, setStorageData];
};
