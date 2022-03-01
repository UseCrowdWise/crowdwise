import {
  KEY_CONTENT_BUTTON_BACKGROUND,
  KEY_CONTENT_BUTTON_PLACEMENT,
  KEY_FONT_SIZES,
  KEY_HIDE_CONTENT_BUTTON,
  KEY_HOTKEYS_TOGGLE_SIDEBAR,
  KEY_INCOGNITO_MODE,
  KEY_SHOULD_COLOR_FOR_SUBMITTED_BY,
  KEY_SHOULD_SHOW_SIDEBAR_ON_RESULTS,
  KEY_SIDEBAR_OPACITY,
  KEY_SIDEBAR_SQUEEZES_PAGE,
  KEY_SIDEBAR_WIDTH,
  SETTINGS_DEBOUNCE_TIME,
} from "../shared/constants";
import { QuestionMarkCircleIcon } from "@heroicons/react/outline";

import * as Slider from "@radix-ui/react-slider";
import _ from "lodash";
import React, { useState } from "react";
import { log } from "../utils/log";
import { useHotkeysPressed } from "../shared/useHotkeysPressed";
import Toggle from "./Toggle";
import SelectMenu from "./SelectMenu";
import {
  CONTENT_BUTTON_PLACEMENT_OPTIONS,
  FONT_SIZE_OPTIONS,
} from "../shared/options";
import { useSettingsStore } from "../shared/settings";
import { indexOfObjectArr } from "../utils/array";
import { classNames } from "../utils/classNames";
import ReactTooltip from "react-tooltip";

const HotkeyButton = () => {
  const [
    settings,
    setValueAll,
    setKeyValue,
    isPersistent,
    error,
    isLoadingStore,
  ] = useSettingsStore();
  const hotkeysToggleSidebar = settings[KEY_HOTKEYS_TOGGLE_SIDEBAR];
  const setHotkeysToggleSidebar = (state: string[]) =>
    setKeyValue(KEY_HOTKEYS_TOGGLE_SIDEBAR, state);

  const [isHotkeyFocused, setIsHotkeyFocused] = useState<boolean>(false);

  log.debug("Hotkey Button rerender", hotkeysToggleSidebar);

  const onKeyPressed = _.debounce((keys: string[]) => {
    log.debug("Key pressed", [keys.join("+")]);
    if (keys.length >= 2) {
      setHotkeysToggleSidebar([keys.join("+")]);
      setIsHotkeyFocused(false);
    }
  }, SETTINGS_DEBOUNCE_TIME);

  const { ref, hotkeysHistory } = useHotkeysPressed<HTMLButtonElement>(
    200,
    onKeyPressed,
    isHotkeyFocused
  );
  log.debug(hotkeysHistory.map((h) => h.key));

  if (isLoadingStore) return null;
  return (
    <div className="relative text-center">
      {isHotkeyFocused && (
        <div className="absolute -top-4 right-0 whitespace-nowrap text-[10px] text-slate-500">
          Enter hotkey
        </div>
      )}
      <button
        ref={ref}
        className={classNames(
          "inline-flex items-center rounded border border-gray-300",
          "px-2.5 py-1.5 text-xs font-medium shadow-sm",
          isHotkeyFocused
            ? "border-none bg-indigo-600 text-white"
            : "bg-white text-gray-700"
        )}
        onClick={() => setIsHotkeyFocused((focus) => !focus)}
        onBlur={() => setIsHotkeyFocused(false)}
      >
        {hotkeysToggleSidebar.join(", ").replaceAll("+", " + ")}
      </button>
    </div>
  );
};

export const SettingsPanel = () => {
  log.debug("Settings Panel rerender");

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
  const shouldColorForSubmittedBy = settings[KEY_SHOULD_COLOR_FOR_SUBMITTED_BY];
  const shouldSidebarSqueezePage = settings[KEY_SIDEBAR_SQUEEZES_PAGE];
  const shouldShowSidebarOnResults =
    settings[KEY_SHOULD_SHOW_SIDEBAR_ON_RESULTS];
  const isIncognitoMode = settings[KEY_INCOGNITO_MODE];

  const setSideBarWidth = (state: number) =>
    setKeyValue(KEY_SIDEBAR_WIDTH, state);
  const setSideBarOpacity = (state: number) =>
    setKeyValue(KEY_SIDEBAR_OPACITY, state);
  const setHideContentButton = (state: boolean) =>
    setKeyValue(KEY_HIDE_CONTENT_BUTTON, state);
  const setContentButtonBackground = (state: boolean) =>
    setKeyValue(KEY_CONTENT_BUTTON_BACKGROUND, state);
  const setContentButtonPlacement = (state: any) =>
    setKeyValue(KEY_CONTENT_BUTTON_PLACEMENT, state);
  const handleSidebarSqueezePage = (state: boolean) =>
    setKeyValue(KEY_SIDEBAR_SQUEEZES_PAGE, state);
  const handleFontSizeChange = (state: Record<string, string>) =>
    setKeyValue(KEY_FONT_SIZES, state);
  const handleIncogChange = (state: boolean) =>
    setKeyValue(KEY_INCOGNITO_MODE, state);
  const handleShouldColorForSubmittedBy = (state: boolean) =>
    setKeyValue(KEY_SHOULD_COLOR_FOR_SUBMITTED_BY, state);
  const handleShouldShowSidebarOnResults = (state: boolean) =>
    setKeyValue(KEY_SHOULD_SHOW_SIDEBAR_ON_RESULTS, state);

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
    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
      <div className="relative grid max-h-[80vh] gap-6 bg-white p-6 scrollbar scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-200">
        <div className="text-lg font-medium">Change settings</div>
        <div className="space-y-2">
          <div>Sidebar Width</div>
          <div className="flex w-full flex-col space-y-8">
            <Slider.Root
              min={300}
              max={640}
              step={4}
              defaultValue={[sideBarWidth]}
              className="relative flex h-4 select-none items-center"
              onValueChange={setSideBarWidthDebounced}
            >
              <Slider.Track className="dark:bg-whiteAlpha-300 flex-grow-1 relative h-1 w-full bg-neutral-200">
                <Slider.Range className="absolute h-full rounded-full bg-indigo-500 dark:bg-indigo-200" />
              </Slider.Track>
              <Slider.Thumb className="block h-5 w-5 rounded-full border border-neutral-300 bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </Slider.Root>
          </div>
        </div>
        <div className="space-y-2">
          <div>Sidebar Opacity</div>
          <div className="flex w-full flex-col space-y-8">
            <Slider.Root
              min={20}
              max={100}
              step={1}
              defaultValue={[sideBarOpacity]}
              className="relative flex h-4 select-none items-center"
              onValueChange={setSideBarOpacityDebounced}
            >
              <Slider.Track className="dark:bg-whiteAlpha-300 flex-grow-1 relative h-1 w-full bg-neutral-200">
                <Slider.Range className="absolute h-full rounded-full bg-indigo-500 dark:bg-indigo-200" />
              </Slider.Track>
              <Slider.Thumb className="block h-5 w-5 rounded-full border border-neutral-300 bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </Slider.Root>
          </div>
        </div>
        <div className="space-y-2">
          <div>Font Size</div>
          <div className="flex w-full flex-col space-y-8">
            <Slider.Root
              min={0}
              max={FONT_SIZE_OPTIONS.length - 1}
              step={1}
              defaultValue={[
                indexOfObjectArr(FONT_SIZE_OPTIONS, settings[KEY_FONT_SIZES]),
              ]}
              className="relative flex h-4 select-none items-center"
              onValueChange={(sizeIds) =>
                handleFontSizeChange(FONT_SIZE_OPTIONS[sizeIds[0]])
              }
            >
              <Slider.Track className="dark:bg-whiteAlpha-300 flex-grow-1 relative h-1 w-full bg-neutral-200">
                <Slider.Range className="absolute h-full rounded-full bg-indigo-500 dark:bg-indigo-200" />
              </Slider.Track>
              <Slider.Thumb className="block h-5 w-5 rounded-full border border-neutral-300 bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </Slider.Root>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <div>Extension Button Placement</div>
          <SelectMenu
            options={CONTENT_BUTTON_PLACEMENT_OPTIONS}
            defaultOption={contentButtonPlacement}
            onSelected={setContentButtonPlacement}
          />
        </div>
        <div
          data-tip="Only shows sidebar when set to auto-open or opened with hotkeys."
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
          data-tip="Adds a more direct indication that results were found for a particular page."
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
            <HotkeyButton />
          </div>
        </div>
      </div>

      <ReactTooltip place="top" type="dark" effect="solid" />
    </div>
  );
};
