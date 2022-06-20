import { QuestionMarkCircleIcon } from "@heroicons/react/outline";
import _ from "lodash";
import React from "react";
import ReactTooltip from "react-tooltip";

import {
  KEY_BOLD_INITIAL_CHARS_OF_WORDS,
  KEY_CONTENT_BUTTON_BACKGROUND,
  KEY_CONTENT_BUTTON_PLACEMENT,
  KEY_FONT_SIZES,
  KEY_HIDE_CONTENT_BUTTON,
  KEY_HOTKEYS_TOGGLE_SIDEBAR,
  KEY_INCOGNITO_MODE,
  KEY_SHOULD_COLOR_FOR_SUBMITTED_BY,
  KEY_SHOULD_SHOW_SIDEBAR_ONLY_ON_EXACT_RESULTS,
  KEY_SHOULD_SHOW_SIDEBAR_ON_RESULTS,
  KEY_SHOULD_USE_OLD_REDDIT_LINK,
  KEY_SIDEBAR_OPACITY,
  KEY_SIDEBAR_SQUEEZES_PAGE,
  KEY_SIDEBAR_WIDTH,
  SETTINGS_DEBOUNCE_TIME,
} from "../shared/constants";
import { EventType, sendEventsToServerViaWorker } from "../shared/events";
import {
  CONTENT_BUTTON_PLACEMENT_OPTIONS,
  FONT_SIZE_OPTIONS,
} from "../shared/options";
import { useSettingsStore } from "../shared/settings";
import { classNames } from "../utils/classNames";
import { log } from "../utils/log";
import HotkeysListenerButton from "./HotkeysListenerButton";
import SelectMenu from "./SelectMenu";
import Slider from "./Slider";
import Toggle from "./Toggle";

interface Props {
  scrollable?: boolean;
}

export const SettingsPanel = (props: Props) => {
  log.debug("Settings Panel rerender");

  const { scrollable } = props;
  const [
    settings,
    setValueAll,
    setKeyValue,
    isPersistent,
    error,
    isLoadingStore,
  ] = useSettingsStore();

  const sideBarWidth = settings[KEY_SIDEBAR_WIDTH];
  const sideBarOpacity = settings[KEY_SIDEBAR_OPACITY];
  const hideContentButton = settings[KEY_HIDE_CONTENT_BUTTON];
  const contentButtonBackground = settings[KEY_CONTENT_BUTTON_BACKGROUND];
  const contentButtonPlacement = settings[KEY_CONTENT_BUTTON_PLACEMENT];
  const shouldUseOldRedditLink = settings[KEY_SHOULD_USE_OLD_REDDIT_LINK];
  const shouldBoldInitialCharsOfWords =
    settings[KEY_BOLD_INITIAL_CHARS_OF_WORDS];
  const shouldColorForSubmittedBy = settings[KEY_SHOULD_COLOR_FOR_SUBMITTED_BY];
  const shouldSidebarSqueezePage = settings[KEY_SIDEBAR_SQUEEZES_PAGE];
  const shouldShowSidebarOnResults =
    settings[KEY_SHOULD_SHOW_SIDEBAR_ON_RESULTS];
  const shouldShowSidebarOnlyOnExactResults =
    settings[KEY_SHOULD_SHOW_SIDEBAR_ONLY_ON_EXACT_RESULTS];
  const isIncognitoMode = settings[KEY_INCOGNITO_MODE];

  const setKeyValueWithEvents = (key: string, value: any) => {
    setKeyValue(key, value);
    sendEventsToServerViaWorker(
      {
        eventType: EventType.CHANGE_SETTING,
        settingKey: key,
        settingValue: value,
      },
      isIncognitoMode
    );
  };

  const setSideBarWidth = (state: number) =>
    setKeyValueWithEvents(KEY_SIDEBAR_WIDTH, state);
  const setSideBarOpacity = (state: number) =>
    setKeyValueWithEvents(KEY_SIDEBAR_OPACITY, state);
  const setHideContentButton = (state: boolean) =>
    setKeyValueWithEvents(KEY_HIDE_CONTENT_BUTTON, state);
  const setContentButtonBackground = (state: boolean) =>
    setKeyValueWithEvents(KEY_CONTENT_BUTTON_BACKGROUND, state);
  const setContentButtonPlacement = (state: any) =>
    setKeyValueWithEvents(KEY_CONTENT_BUTTON_PLACEMENT, state);
  const handleSidebarSqueezePage = (state: boolean) =>
    setKeyValueWithEvents(KEY_SIDEBAR_SQUEEZES_PAGE, state);
  const handleFontSizeChange = (state: Record<string, string>) =>
    setKeyValueWithEvents(KEY_FONT_SIZES, state);
  const handleIncogChange = (state: boolean) =>
    setKeyValueWithEvents(KEY_INCOGNITO_MODE, state);
  const handleShouldUseOldRedditLink = (state: boolean) =>
    setKeyValueWithEvents(KEY_SHOULD_USE_OLD_REDDIT_LINK, state);
  const handleShouldBoldInitialCharsOfWords = (state: boolean) =>
    setKeyValueWithEvents(KEY_BOLD_INITIAL_CHARS_OF_WORDS, state);
  const handleShouldColorForSubmittedBy = (state: boolean) =>
    setKeyValueWithEvents(KEY_SHOULD_COLOR_FOR_SUBMITTED_BY, state);
  const handleShouldShowSidebarOnResults = (state: boolean) =>
    setKeyValueWithEvents(KEY_SHOULD_SHOW_SIDEBAR_ON_RESULTS, state);
  const handleShouldShowSidebarOnlyOnExactResults = (state: boolean) =>
    setKeyValueWithEvents(KEY_SHOULD_SHOW_SIDEBAR_ONLY_ON_EXACT_RESULTS, state);

  const setSideBarWidthDebounced = _.debounce((value: any) => {
    setSideBarWidth(value);
  }, SETTINGS_DEBOUNCE_TIME);
  const setSideBarOpacityDebounced = _.debounce((value: any) => {
    // Set to 99.99 because a value of 100 seems to have problems re-rendering
    if (value == 100) value = 99.99;
    setSideBarOpacity(value);
  }, SETTINGS_DEBOUNCE_TIME);

  if (isLoadingStore) return null;
  return (
    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 dark:text-zinc-300">
      <div
        className={classNames(
          "relative grid gap-5 bg-white dark:bg-gray-800 p-6 scrollbar scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-200 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-600",
          scrollable ? "max-h-[80vh]" : ""
        )}
      >
        <div className="text-lg font-medium">Change settings</div>
        <div className="pt-2 text-base font-medium">Sidebar</div>
        <div className="space-y-2">
          <div>Sidebar Width</div>
          <Slider
            min={300}
            max={640}
            step={4}
            defaultValue={[sideBarWidth]}
            onValueChange={setSideBarWidthDebounced}
          />
        </div>
        <div className="space-y-2">
          <div>Sidebar Opacity</div>
          <Slider
            min={20}
            max={100}
            step={1}
            defaultValue={[sideBarOpacity]}
            onValueChange={setSideBarOpacityDebounced}
          />
        </div>
        <div
          data-tip="Attempts to squeeze the page to fit the sidebar and if it doesn't work, it will overlay on top of the page."
          className="flex flex-row items-center space-x-2"
        >
          <div>
            <div className="mr-1 inline">
              Sidebar Tries To Squeeze Page When Opened
            </div>
            <QuestionMarkCircleIcon className="inline h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="grow" />
          <Toggle
            checked={shouldSidebarSqueezePage}
            onCheck={handleSidebarSqueezePage}
          />
        </div>
        <div
          data-tip="Sidebar will automatically open when results are found for the current page."
          className="flex flex-row items-center space-x-2"
        >
          <div>
            <div className="mr-1 inline">Sidebar Opens When Results Found</div>
            <QuestionMarkCircleIcon className="inline h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="grow" />
          <Toggle
            checked={shouldShowSidebarOnResults}
            onCheck={handleShouldShowSidebarOnResults}
          />
        </div>
        <div
          data-tip="Sidebar only opens when we find results for the exact page being browsed."
          className="flex flex-row items-center space-x-2"
        >
          <div>
            <div className="mr-1 inline">
              Sidebar Only Opens When Exact Results Found
            </div>
            <QuestionMarkCircleIcon className="inline h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="grow" />
          <Toggle
            checked={shouldShowSidebarOnlyOnExactResults}
            onCheck={handleShouldShowSidebarOnlyOnExactResults}
          />
        </div>
        <div className="space-y-2">
          <div>Keyboard Shortcuts</div>
          <div className="text-xs text-slate-400">
            Click on the keyboard shortcuts on the right to change them. When
            "Enter hotkey" is shown, press a combination of two keys, e.g.,
            "Control" and "G", to set the new hotkey combination.
          </div>
          <div className="flex flex-row items-center">
            <div className="text-slate-600">Toggle Sidebar</div>
            <div className="grow" />
            <HotkeysListenerButton settingsKey={KEY_HOTKEYS_TOGGLE_SIDEBAR} />
          </div>
        </div>

        <div className="pt-5 text-base font-medium">General</div>
        <div className="space-y-2">
          <div>Font Size</div>
          <Slider
            choices={FONT_SIZE_OPTIONS}
            defaultValue={[settings[KEY_FONT_SIZES]]}
            onValueChange={handleFontSizeChange}
          />
        </div>
        <div
          data-tip="Enable Bionic Reading - bold the initial characters of words in order to enhance your reading experience."
          className="flex flex-row items-center space-x-2"
        >
          <div>
            <div className="mr-1 inline">Bionic Reading</div>
            <QuestionMarkCircleIcon className="inline h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="grow" />
          <Toggle
            checked={shouldBoldInitialCharsOfWords}
            onCheck={handleShouldBoldInitialCharsOfWords}
          />
        </div>
        <div
          data-tip="Links from Reddit go to old.reddit.com instead of reddit.com."
          className="flex flex-row items-center space-x-2"
        >
          <div>
            <div className="mr-1 inline">
              Use old.reddit.com instead of reddit.com
            </div>
            <QuestionMarkCircleIcon className="inline h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="grow" />
          <Toggle
            checked={shouldUseOldRedditLink}
            onCheck={handleShouldUseOldRedditLink}
          />
        </div>
        <div
          data-tip="Color the name of each discussion author differently to identify different points of view. "
          className="flex flex-row items-center space-x-2"
        >
          <div>
            <div className="mr-1 inline">Color Author Names</div>
            <QuestionMarkCircleIcon className="inline h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="grow" />
          <Toggle
            checked={shouldColorForSubmittedBy}
            onCheck={handleShouldColorForSubmittedBy}
          />
        </div>
        <div
          data-tip="Only start searching for discussions when the sidebar is clicked."
          className="flex flex-row items-center space-x-2"
        >
          <div>
            <div className="mr-1 inline">Incognito Mode</div>
            <QuestionMarkCircleIcon className="inline h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="grow" />
          <Toggle checked={isIncognitoMode} onCheck={handleIncogChange} />
        </div>

        <div className="pt-5 text-base font-medium">Extension Button</div>
        <div className="flex flex-col space-y-2">
          <div>Extension Button Placement</div>
          <SelectMenu
            options={CONTENT_BUTTON_PLACEMENT_OPTIONS}
            defaultOption={contentButtonPlacement}
            onSelected={setContentButtonPlacement}
          />
        </div>
        <div
          data-tip="Hide the extension button that is normally on the corners of the page."
          className="flex flex-row items-center space-x-2"
        >
          <div>
            <div className="mr-1 inline">Extension Button Hidden</div>
            <QuestionMarkCircleIcon className="inline h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="grow" />
          <Toggle checked={hideContentButton} onCheck={setHideContentButton} />
        </div>
        <div
          data-tip="Adds a solid background to the floating extension button for better visibility."
          className="flex flex-row items-center space-x-2"
        >
          <div>
            <div className="mr-1 inline">Extension Button Background</div>
            <QuestionMarkCircleIcon className="inline h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="grow" />
          <Toggle
            checked={contentButtonBackground}
            onCheck={setContentButtonBackground}
          />
        </div>
      </div>

      <ReactTooltip place="top" type="dark" effect="solid" />
    </div>
  );
};
