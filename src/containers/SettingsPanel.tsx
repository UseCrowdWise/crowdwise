import { useChromeStorage } from "../shared/useChromeStorage";
import {
  KEY_SIDEBAR_WIDTH,
  KEY_SIDEBAR_OPACITY,
  SETTINGS_DEBOUNCE_TIME,
  DEFAULT_SIDEBAR_WIDTH,
  DEFAULT_SIDEBAR_OPACITY,
  KEY_HOTKEYS_TOGGLE_SIDEBAR,
  DEFAULT_HOTKEYS_TOGGLE_SIDEBAR,
} from "../shared/constants";
import * as Slider from "@radix-ui/react-slider";
import _ from "lodash";
import React from "react";
import { log } from "../utils/log";
import { useHotkeysPressed } from "../shared/useHotkeysPressed";

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

  const [sideBarWidth, setSideBarWidth] = useChromeStorage(
    KEY_SIDEBAR_WIDTH,
    DEFAULT_SIDEBAR_WIDTH
  );
  const [sideBarOpacity, setSideBarOpacity] = useChromeStorage(
    KEY_SIDEBAR_OPACITY,
    DEFAULT_SIDEBAR_OPACITY
  );

  const setSideBarWidthDebounced = _.debounce((value: any) => {
    setSideBarWidth(value);
  }, SETTINGS_DEBOUNCE_TIME);
  const setSideBarOpacityDebounced = _.debounce((value: any) => {
    if (value == 100) value = 99.99; // Avoid
    log.debug(`Setting opacity to ${value}`)
    setSideBarOpacity(value);
  }, SETTINGS_DEBOUNCE_TIME);

  if (sideBarWidth === null || sideBarOpacity === null) return null;
  return (
    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
      <div className="relative grid gap-4 bg-white p-6">
        <div className="text-lg font-semibold">Change settings</div>
        <div className="space-y-2">
          <div>Sidebar Width</div>
          <div className="flex w-full flex-col space-y-8">
            <Slider.Root
              min={20}
              max={48}
              step={1}
              defaultValue={[sideBarWidth]}
              className="relative flex h-4 select-none items-center"
              onValueChange={setSideBarWidthDebounced}
            >
              <Slider.Track className="dark:bg-whiteAlpha-300 flex-grow-1 relative h-1 w-full bg-neutral-200">
                <Slider.Range className="absolute h-full rounded-full bg-blue-500 dark:bg-blue-200" />
              </Slider.Track>
              <Slider.Thumb className="block h-5 w-5 rounded-full border border-neutral-300 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
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
                <Slider.Range className="absolute h-full rounded-full bg-blue-500 dark:bg-blue-200" />
              </Slider.Track>
              <Slider.Thumb className="block h-5 w-5 rounded-full border border-neutral-300 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </Slider.Root>
          </div>
        </div>
        <div className="space-y-2">
          <div>Keyboard Shortcuts</div>
          <div className="text-xs text-slate-400">
            Click on the keyboard shortcuts on the right to change them. Refresh
            to see the changes.
          </div>
          <div className="flex flex-row items-center">
            <div>Toggle Open</div>
            <div className="grow" />
            <HotkeyButton />
          </div>
        </div>
      </div>
    </div>
  );
};
