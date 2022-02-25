import useChromeStorage from "./useChromeStorage";
import createChromeStorageStateHook from "./createChromeStorageStateHook";

/**
 * Hook which will use `chrome.storage.local` to persist state.
 *
 * @param {string} key - they key name in chrome's storage. Nested keys not supported
 * @param {*} [initialValue] - default value to use
 * @returns {[any, (value: any) => void, boolean, string, boolean]} - array of
 *      stateful `value`,
 *      function to update this `value`,
 *      `isPersistent` - will be `false` if error occurred during reading/writing chrome.storage,
 *      `error` - will contain error appeared in storage. if isPersistent is true will be empty string
 */
function useChromeStorageLocal(key, initialValue) {
  return useChromeStorage(key, initialValue, "local");
}

/**
 * Hook which will use `chrome.storage.sync` to persist state.
 *
 * @param {string} key - they key name in chrome's storage. Nested keys not supported
 * @param {*} [initialValue] - default value to use
 * @returns {[any, (value: any) => void, boolean, string, boolean]} - array of
 *      stateful `value`,
 *      function to update this `value`,
 *      `isPersistent` - will be `false` if error occurred during reading/writing chrome.storage,
 *      `error` - will contain error appeared in storage. if isPersistent is true will be empty string
 */
function useChromeStorageSync(key, initialValue) {
  return useChromeStorage(key, initialValue, "sync");
}

/**
 * Use to create state with chrome.storage.local.
 * Useful if you want to reuse same state across components and/or context (like in popup, content script, background pages)
 *
 * @param {string} key - they key name in chrome's storage. Nested keys not supported
 * @param {*} [initialValue] - default value to use
 * @returns {function(): [any, (value: any) => void, boolean, string, boolean]}
 */
function createChromeStorageStateHookLocal(key, initialValue) {
  return createChromeStorageStateHook(key, initialValue, "local");
}

/**
 * Use to create state with chrome.storage.sync.
 * Useful if you want to reuse same state across components and/or context (like in popup, content script, background pages)
 *
 * @param {string} key - they key name in chrome's storage. Nested keys not supported
 * @param {*} [initialValue] - default value to use
 * @returns {function(): [any, (value: any) => void, boolean, string, boolean]}
 */
function createChromeStorageStateHookSync(key, initialValue) {
  return createChromeStorageStateHook(key, initialValue, "sync");
}

export {
  useChromeStorageLocal,
  useChromeStorageSync,
  createChromeStorageStateHookLocal,
  createChromeStorageStateHookSync,
};
