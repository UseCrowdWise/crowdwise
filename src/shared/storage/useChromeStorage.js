import { useCallback, useEffect, useState } from "react";
import { storage } from "./storage";

/**
 * Basic hook for storage
 * @param {string} key
 * @param {*} initialValue
 * @param {'local'|'sync'} storageArea
 * @returns {[*, function(*= any): void, boolean, string, boolean]}
 */
export default function useChromeStorage(key, initialValue, storageArea) {
  const [INITIAL_VALUE] = useState(() => {
    return typeof initialValue === "function" ? initialValue() : initialValue;
  });
  const [STORAGE_AREA] = useState(storageArea);
  const [state, setState] = useState(INITIAL_VALUE);
  const [isPersistent, setIsPersistent] = useState(true);
  const [error, setError] = useState("");
  const [isLoadingStorage, setIsLoadingStorage] = useState(true);

  useEffect(() => {
    setIsLoadingStorage(true);
    storage
      .get(key, INITIAL_VALUE, STORAGE_AREA)
      .then((res) => {
        setState(res);
        setIsPersistent(true);
        setError("");
        setIsLoadinStorageg(false);
      })
      .catch((error) => {
        setIsPersistent(false);
        setError(error);
        setIsLoadingStorage(false);
      });
  }, [key, INITIAL_VALUE, STORAGE_AREA]);

  const updateValue = useCallback(
    (newValue) => {
      const toStore =
        typeof newValue === "function" ? newValue(state) : newValue;
      storage
        .set(key, toStore, STORAGE_AREA)
        .then(() => {
          setIsPersistent(true);
          setError("");
        })
        .catch((error) => {
          // set newValue to local state because chrome.storage.onChanged won't be fired in error case
          setState(toStore);
          setIsPersistent(false);
          setError(error);
        });
    },
    [STORAGE_AREA, key, state]
  );

  useEffect(() => {
    const onChange = (changes, areaName) => {
      if (areaName === STORAGE_AREA && key in changes) {
        setState(changes[key].newValue);
        setIsPersistent(true);
        setError("");
      }
    };
    chrome.storage.onChanged.addListener(onChange);
    return () => {
      chrome.storage.onChanged.removeListener(onChange);
    };
  }, [key, STORAGE_AREA]);

  return [state, updateValue, isPersistent, error, isLoadingStorage];
}
