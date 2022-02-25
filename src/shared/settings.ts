import { createChromeStorageStateHookLocal } from "./storage/index";
import { KEY_INCOGNITO_MODE, DEFAULT_INCOGNITO_MODE } from "./constants";

const SETTINGS_KEY = "settings";
const INITIAL_VALUE = {
  [KEY_INCOGNITO_MODE]: DEFAULT_INCOGNITO_MODE,
};

export const useSettingsStore = createChromeStorageStateHookLocal(
  SETTINGS_KEY,
  INITIAL_VALUE
);
