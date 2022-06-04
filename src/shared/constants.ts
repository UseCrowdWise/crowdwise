import { CONTENT_BUTTON_PLACEMENT_OPTIONS, FONT_SIZE_OPTIONS } from "./options";

export const EVENTS_HOST_PROD = "https://crowdwise-web.vercel.app/api/events";
export const EVENTS_HOST_STAGING = "http://localhost:3000/api/events";
export const EVENTS_HOST =
  process.env.NODE_ENV === "production"
    ? EVENTS_HOST_PROD
    : EVENTS_HOST_STAGING;

export const ML_HOST =
  "https://crowdwise-ml-jhhom.ondigitalocean.app/api/score_documents";
export const ML_API_KEY = "5b58147b-d869-465a-ab43-41c2ffc29ae0";
export const ML_FILTER_THRESHOLD = -5.0;

export const DEBUG_MODE = false;
export const GITHUB_REPOSITORY_LINK =
  "https://github.com/usecrowdwise/crowdwise";

export const SETTINGS_DEBOUNCE_TIME = 100;
export const DEFAULT_IS_DARK_MODE = false;
export const DEFAULT_SIDEBAR_SQUEEZES_PAGE = false;
export const DEFAULT_SIDEBAR_WIDTH = 360; // px
export const DEFAULT_SIDEBAR_OPACITY = 100; // Divided by 100
export const DEFAULT_FONT_SIZES = FONT_SIZE_OPTIONS[6];
export const DEFAULT_BOLD_INITIAL_CHARS_OF_WORDS = false;
export const DEFAULT_HIDE_CONTENT_BUTTON = false;
export const DEFAULT_CONTENT_BUTTON_BACKGROUND = false;
export const DEFAULT_CONTENT_BUTTON_PLACEMENT =
  CONTENT_BUTTON_PLACEMENT_OPTIONS[3];
export const DEFAULT_CONTENT_BUTTON_PLACEMENT_OFFSET = "16px";
export const DEFAULT_SIDEBAR_OPEN_TAB_STATE = false;
export const DEFAULT_INCOGNITO_MODE = false;
export const DEFAULT_SHOULD_COLOR_FOR_SUBMITTED_BY = true;
export const DEFAULT_SHOULD_SHOW_SIDEBAR_ON_RESULTS = false;
export const DEFAULT_SHOULD_SHOW_SIDEBAR_ONLY_ON_EXACT_RESULTS = false;

// Hotkeys. See reference for special shortcuts.
// https://github.com/JohannesKlauss/react-hotkeys-hook
export const DEFAULT_HOTKEYS_TOGGLE_SIDEBAR = ["ctrl+.", "⌘+."];
export const DEFAULT_HOTKEYS_CLOSE_SIDEBAR = ["esc"];

// Chrome storage keys
export const KEY_IS_DARK_MODE = "is-dark-mode";
export const KEY_HOTKEYS_TOGGLE_SIDEBAR = "hotkeys-toggle-sidebar";
export const KEY_SIDEBAR_SQUEEZES_PAGE = "sidebar-squeeze-page";
export const KEY_SIDEBAR_WIDTH = "sidebar-width";
export const KEY_SIDEBAR_OPACITY = "sidebar-opacity";
export const KEY_FONT_SIZES = "font-sizes";
export const KEY_BOLD_INITIAL_CHARS_OF_WORDS = "bold-initial-chars-of-words";
export const KEY_HIDE_CONTENT_BUTTON = "hide-content-button";
export const KEY_CONTENT_BUTTON_BACKGROUND = "content-button-background";
export const KEY_CONTENT_BUTTON_PLACEMENT = "content-button-placement";
export const KEY_SIDEBAR_OPEN_TAB_STATE = "sidebar-open-tab-state";
export const KEY_INCOGNITO_MODE = "sidebar-incognito-mode";
export const KEY_SHOULD_COLOR_FOR_SUBMITTED_BY =
  "should-color-for-submitted-by";
export const KEY_SHOULD_SHOW_SIDEBAR_ON_RESULTS = "show-sidebar-on-results";
export const KEY_SHOULD_SHOW_SIDEBAR_ONLY_ON_EXACT_RESULTS =
  "show-sidebar-only-on-exact-results";

// Cache settings
export const CACHE_URL_DURATION_SEC = 120;
export const CACHE_CLEAR_URL_ALARM_INTERVAL_MIN = 1;
export const CACHE_CLEAR_TABID_ALARM_INTERVAL_MIN = 5;
export const CACHE_CLEAR_URL_ALARM_NAME = "refresh_url_cache";
export const CACHE_CLEAR_TABID_ALARM_NAME = "refresh_tabid_cache";

// Color settings
const COLOR_MAP_FOR_STRINGS = {
  "text-red-600": "abc",
  "text-yellow-600": "def",
  "text-green-600": "ghij",
  "text-teal-600": "klmn",
  "text-cyan-600": "opqr",
  "text-blue-600": "stuv",
  "text-fuchsia-600": "wxyz",
};
export const COLOR_IF_OUTSIDE_HASH = "text-slate-600";
export const COLOR_HASH_FOR_STRINGS = Object.entries(
  COLOR_MAP_FOR_STRINGS
).reduce(function (obj: Record<string, string>, [color, values]) {
  for (const char of values) {
    obj[char] = color;
  }
  return obj;
}, {});
