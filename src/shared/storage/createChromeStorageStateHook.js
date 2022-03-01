// From: https://github.com/onikienko/use-chrome-storage
import { useCallback, useEffect } from "react";

import useChromeStorage from "./useChromeStorage";

export default function createChromeStorageStateHook(
  key,
  initialValue,
  storageArea
) {
  const consumers = [];

  return function useCreateChromeStorageHook() {
    const [value, setValue, isPersistent, error, isLoadingStorage] =
      useChromeStorage(key, initialValue, storageArea);

    const setValueAll = useCallback((newValue) => {
      for (const consumer of consumers) {
        consumer(newValue);
      }
    }, []);

    const setKeyValue = (key, newValue) => {
      setValueAll((prevState) => {
        return {
          ...prevState,
          [key]: newValue,
        };
      });
    };

    useEffect(() => {
      consumers.push(setValue);
      return () => {
        consumers.splice(consumers.indexOf(setValue), 1);
      };
    }, [setValue]);

    return [
      value,
      setValueAll,
      setKeyValue,
      isPersistent,
      error,
      isLoadingStorage,
    ];
  };
}
