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
  DEFAULT_INCOGNITO_MODE,
} from "../shared/constants";
import * as Slider from "@radix-ui/react-slider";
import _ from "lodash";
import React from "react";
import { log } from "../utils/log";
import { useHotkeysPressed } from "../shared/useHotkeysPressed";
import Toggle from "./Toggle";
import SelectMenu from "./SelectMenu";
import { CONTENT_BUTTON_PLACEMENT_OPTIONS } from "../shared/options";

const HotkeyButton = () => {
  const [hotkeysToggleSidebar, setHotkeysToggleSidebar] = useChromeStorage(
    KEY_HOTKEYS_TOGGLE_SIDEBAR,
    DEFAULT_HOTKEYS_TOGGLE_SIDEBAR,
    []
  );

  log.debug("Hotkey Button rerender", hotkeysToggleSidebar);

  const onKeyPressed = (keys: string[]) => {
    log.debug("Key pressed", [keys.join("+")]);
    setHotkeysToggleSidebar([keys.join("+")]);
  };

  const { ref, hotkeysHistory } = useHotkeysPressed<HTMLButtonElement>(
    200,
    onKeyPressed
  );
  log.debug(hotkeysHistory.map((h) => h.key));
  return (
    <>
      <button
        ref={ref}
        className="
        inline-flex items-center rounded border border-gray-300
        bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm
        hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        "
      >
        {hotkeysToggleSidebar.join(", ").replaceAll("+", " + ")}
      </button>
    </>
  );
};

export const SettingsPanel = () => {
  log.debug("Settings Panel rerender");

  // NOTE: IF YOU ADD MORE SETTINGS BELOW,
  //   UPDATE THE if(...) return null below!

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
  const [isIncognito, setIsIncognito] = useChromeStorage(
    KEY_INCOGNITO_MODE,
    DEFAULT_INCOGNITO_MODE
  );

  const setSideBarWidthDebounced = _.debounce((value: any) => {
    setSideBarWidth(value);
  }, SETTINGS_DEBOUNCE_TIME);
  const setSideBarOpacityDebounced = _.debounce((value: any) => {
    if (value == 100) value = 99.99; // Avoid
    log.debug(`Setting opacity to ${value}`);
    setSideBarOpacity(value);
  }, SETTINGS_DEBOUNCE_TIME);

  // NOTE: IF YOU ADD MORE SETTINGS ABOVE,
  //   UPDATE THE if(...) return null below!

  if (
    sideBarWidth === null ||
    sideBarOpacity === null ||
    hideContentButton === null ||
    contentButtonPlacement === null ||
    isIncognito === null
  )
    return null;
  return (
    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
      <div className="relative grid gap-6 bg-white p-6">
        <div className="text-lg font-semibold">Change settings</div>
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
        <div className="flex flex-col space-y-2">
          <div>Extension Button Placement</div>
          <SelectMenu
            options={CONTENT_BUTTON_PLACEMENT_OPTIONS}
            defaultOption={contentButtonPlacement}
            onSelected={setContentButtonPlacement}
          />
        </div>
        <div className="flex flex-row items-center space-x-2">
          <div>Hide Extension Button</div>
          <div className="grow" />
          <Toggle checked={hideContentButton} onCheck={setHideContentButton} />
        </div>
        <div className="flex flex-row items-center space-x-2">
          <div>Extension Button Background</div>
          <div className="grow" />
          <Toggle
            checked={contentButtonBackground}
            onCheck={setContentButtonBackground}
          />
        </div>
        <div className="flex flex-row items-center space-x-2">
          <div>Incognito Mode</div>
          <div className="grow" />
          <Toggle checked={isIncognito} onCheck={setIsIncognito} />
        </div>
        <div className="space-y-2">
          <div>Keyboard Shortcuts</div>
          <div className="text-xs text-slate-400">
            Click on the keyboard shortcuts on the right to change them.{" "}
            <span className="font-semibold text-indigo-600">Refresh</span> to
            see the changes.
          </div>
          <div className="flex flex-row items-center">
            <div className="text-slate-600">Toggle Open</div>
            <div className="grow" />
            <HotkeyButton />
          </div>
        </div>
      </div>
    </div>
  );
};
