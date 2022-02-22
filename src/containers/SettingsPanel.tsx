import { useChromeStorage } from "../shared/useChromeStorage";
import {
  KEY_SIDEBAR_WIDTH,
  KEY_SIDEBAR_OPACITY,
  SETTINGS_DEBOUNCE_TIME,
  DEFAULT_SIDEBAR_WIDTH,
  DEFAULT_SIDEBAR_OPACITY,
} from "../shared/constants";
import * as Slider from "@radix-ui/react-slider";
import _ from "lodash";
import React from "react";

export const SettingsPanel = () => {
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
    setSideBarOpacity(value);
  }, SETTINGS_DEBOUNCE_TIME);

  if (sideBarWidth === null || sideBarOpacity === null) return null;
  return (
    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
      <div className="relative grid gap-4 bg-white p-6">
        <div className="text-lg font-semibold">Change settings</div>
        <div className="space-y-2">
          <div>Sidebar Width</div>
          <div className="flex flex-col w-full space-y-8">
            <Slider.Root
              min={20}
              max={48}
              step={1}
              defaultValue={[sideBarWidth]}
              className="relative flex items-center h-4 select-none"
              onValueChange={setSideBarWidthDebounced}
            >
              <Slider.Track className="relative w-full h-1 bg-neutral-200 dark:bg-whiteAlpha-300 flex-grow-1">
                <Slider.Range className="absolute h-full rounded-full bg-blue-500 dark:bg-blue-200" />
              </Slider.Track>
              <Slider.Thumb className="block w-5 h-5 bg-white border rounded-full border-neutral-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </Slider.Root>
          </div>
        </div>
        <div className="space-y-2">
          <div>Sidebar Opacity</div>
          <div className="flex flex-col w-full space-y-8">
            <Slider.Root
              min={20}
              max={100}
              step={1}
              defaultValue={[sideBarOpacity]}
              className="relative flex items-center h-4 select-none"
              onValueChange={setSideBarOpacityDebounced}
            >
              <Slider.Track className="relative w-full h-1 bg-neutral-200 dark:bg-whiteAlpha-300 flex-grow-1">
                <Slider.Range className="absolute h-full rounded-full bg-blue-500 dark:bg-blue-200" />
              </Slider.Track>
              <Slider.Thumb className="block w-5 h-5 bg-white border rounded-full border-neutral-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </Slider.Root>
          </div>
        </div>
      </div>
    </div>
  );
};
