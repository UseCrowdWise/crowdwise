import { useChromeStorage } from "../shared/useChromeStorage";
import { KEY_SIDEBAR_WIDTH } from "../shared/constants";
import * as Slider from "@radix-ui/react-slider";
import _ from "lodash";
import { log } from "../utils/log";
import React from "react";

export const SettingsPanel = () => {
  const [sideBarWidth, setSideBarWidth] = useChromeStorage(
    KEY_SIDEBAR_WIDTH,
    24
  );
  if (sideBarWidth === null) return null;
  return (
    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
      <div className="relative grid gap-4 bg-white p-6">
        <div className="text-lg font-semibold">Change settings</div>
        <div className="space-y-2">
          <div>Sidebar Width</div>
          <div className="flex flex-col w-full space-y-8">
            <Slider.Root
              defaultValue={[sideBarWidth]}
              min={20}
              max={48}
              step={1}
              className="relative flex items-center h-4 select-none"
              onValueChange={_.debounce((value: any) => {
                setSideBarWidth(value);
              }, 400)}
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
              defaultValue={[50]}
              className="relative flex items-center h-4 select-none"
              onValueChange={(value) => {
                log.debug(Math.round(value[0] / 100));
              }}
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
