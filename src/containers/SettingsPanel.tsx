import { useChromeStorage } from "../shared/useChromeStorage";
import {
  KEY_SIDEBAR_WIDTH,
  KEY_SIDEBAR_OPACITY,
  SETTINGS_DEBOUNCE_TIME,
  DEFAULT_SIDEBAR_WIDTH,
  DEFAULT_SIDEBAR_OPACITY,
  KEY_HOTKEYS_TOGGLE_SIDEBAR,
  DEFAULT_HOTKEYS_TOGGLE_SIDEBAR,
  KEY_HIDE_CONTENT_BUTTON,
  DEFAULT_HIDE_CONTENT_BUTTON,
  DEFAULT_CONTENT_BUTTON_PLACEMENT,
  KEY_CONTENT_BUTTON_PLACEMENT,
  DEFAULT_CONTENT_BUTTON_BACKGROUND,
  KEY_CONTENT_BUTTON_BACKGROUND,
  KEY_INCOGNITO_MODE,
  KEY_FONT_SIZES,
  KEY_SHOULD_COLOR_FOR_SUBMITTED_BY,
  KEY_SHOULD_SHOW_SIDEBAR_ON_RESULTS,
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

  const handleFontSizeChange = (state: Record<string, string>) =>
    setKeyValue(KEY_FONT_SIZES, state);
  const handleIncogChange = (state: boolean) =>
    setKeyValue(KEY_INCOGNITO_MODE, state);
  const handleShouldColorForSubmittedBy = (state: boolean) =>
    setKeyValue(KEY_SHOULD_COLOR_FOR_SUBMITTED_BY, state);
  const handleShouldShowSidebarOnResults = (state: boolean) =>
    setKeyValue(KEY_SHOULD_SHOW_SIDEBAR_ON_RESULTS, state);

  const [sideBarWidth, setSideBarWidth] = useChromeStorage(
    KEY_SIDEBAR_WIDTH,
    DEFAULT_SIDEBAR_WIDTH
  );
  const [sideBarOpacity, setSideBarOpacity] = useChromeStorage(
    KEY_SIDEBAR_OPACITY,
    DEFAULT_SIDEBAR_OPACITY
  );
  const [hideContentButton, setHideContentButton] = useChromeStorage(
    KEY_HIDE_CONTENT_BUTTON,
    DEFAULT_HIDE_CONTENT_BUTTON
  );
  const [contentButtonBackground, setContentButtonBackground] =
    useChromeStorage(
      KEY_CONTENT_BUTTON_BACKGROUND,
      DEFAULT_CONTENT_BUTTON_BACKGROUND
    );
  const [contentButtonPlacement, setContentButtonPlacement] = useChromeStorage(
    KEY_CONTENT_BUTTON_PLACEMENT,
    DEFAULT_CONTENT_BUTTON_PLACEMENT
  );

  const setSideBarWidthDebounced = _.debounce((value: any) => {
    setSideBarWidth(value);
  }, SETTINGS_DEBOUNCE_TIME);
  const setSideBarOpacityDebounced = _.debounce((value: any) => {
    // Set to 99.99 because a value of 100 seems to have problems re-rendering
    if (value == 100) value = 99.99;
    log.debug(`Setting opacity to ${value}`);
    setSideBarOpacity(value);
  }, SETTINGS_DEBOUNCE_TIME);
  /* const [isIncognito, setIsIncognito] = useChromeStorage(
   *   KEY_INCOGNITO_MODE,
   *   DEFAULT_INCOGNITO_MODE
   * );
   */
  if (
    sideBarWidth === null ||
    sideBarOpacity === null ||
    hideContentButton === null ||
    contentButtonPlacement === null ||
    isLoadingStore
  )
    return null;
  return (
    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
      <div className="relative grid gap-6 bg-white p-6">
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
        <div className="flex flex-row items-center space-x-2">
          <div>
            <div className="mr-1 inline">Hide Extension Button</div>
            <QuestionMarkCircleIcon
              data-tip="Only shows sidebar when set to auto-open or opened with hotkeys."
              className="inline h-4 w-4 text-slate-500"
            />
          </div>
          <div className="grow" />
          <Toggle checked={hideContentButton} onCheck={setHideContentButton} />
        </div>
        <div className="flex flex-row items-center space-x-2">
          <div>
            <div className="mr-1 inline">Extension Button Background</div>
            <QuestionMarkCircleIcon
              data-tip="Adds a solid background to the floating extension button for better visibility."
              className="inline h-4 w-4 text-slate-500"
            />
          </div>
          <div className="grow" />
          <Toggle
            checked={contentButtonBackground}
            onCheck={setContentButtonBackground}
          />
        </div>
        <div className="flex flex-row items-center space-x-2">
          <div>
            <div className="mr-1 inline">Color Author Names</div>
            <QuestionMarkCircleIcon
              data-tip="Color the name of each discussion author differently to identify different points of view. "
              className="inline h-4 w-4 text-slate-500"
            />
          </div>
          <div className="grow" />
          <Toggle
            checked={settings[KEY_SHOULD_COLOR_FOR_SUBMITTED_BY]}
            onCheck={handleShouldColorForSubmittedBy}
          />
        </div>
        <div className="flex flex-row items-center space-x-2">
          <div>
            <div className="mr-1 inline">
              Automatically Open Sidebar When Results Found
            </div>
            <QuestionMarkCircleIcon
              data-tip="Adds a more direct indication that results were found for a particular page."
              className="inline h-4 w-4 text-slate-500"
            />
          </div>
          <div className="grow" />
          <Toggle
            checked={settings[KEY_SHOULD_SHOW_SIDEBAR_ON_RESULTS]}
            onCheck={handleShouldShowSidebarOnResults}
          />
        </div>
        <div className="flex flex-row items-center space-x-2">
          <div>
            <div className="mr-1 inline">Incognito Mode</div>
            <QuestionMarkCircleIcon
              data-tip="Only start searching for discussions when the sidebar is clicked."
              className="inline h-4 w-4 text-slate-500"
            />
          </div>
          <div className="grow" />
          <Toggle
            checked={settings[KEY_INCOGNITO_MODE]}
            onCheck={handleIncogChange}
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
            <HotkeyButton />
          </div>
        </div>
      </div>

      <ReactTooltip place="top" type="dark" effect="solid" />
    </div>
  );
};
