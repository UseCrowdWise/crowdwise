import { QuestionMarkCircleIcon } from "@heroicons/react/outline";
import React from "react";
import ReactTooltip from "react-tooltip";

import {
  KEY_INCOGNITO_MODE,
  KEY_RESULT_FEED_SORT_EXACT_URL_FIRST,
  KEY_RESULT_FEED_SORT_OPTION,
} from "../shared/constants";
import { EventType, sendEventsToServerViaWorker } from "../shared/events";
import {
  CONTENT_BUTTON_PLACEMENT_OPTIONS,
  RESULT_FEED_SORT_OPTIONS,
} from "../shared/options";
import { useSettingsStore } from "../shared/settings";
import { classNames } from "../utils/classNames";
import { log } from "../utils/log";
import SelectMenu from "./SelectMenu";
import Toggle from "./Toggle";

interface Props {
  scrollable?: boolean;
}

export const ResultFeedSettingsPanel = (props: Props) => {
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

  const isIncognitoMode = settings[KEY_INCOGNITO_MODE];
  const resultFeedSortExactUrlFirst =
    settings[KEY_RESULT_FEED_SORT_EXACT_URL_FIRST];
  const resultFeedSortOption = settings[KEY_RESULT_FEED_SORT_OPTION];

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

  const setResultFeedSortOption = (state: any) =>
    setKeyValueWithEvents(KEY_RESULT_FEED_SORT_OPTION, state);
  const setResultFeedSortExactUrlFirst = (state: boolean) =>
    setKeyValueWithEvents(KEY_RESULT_FEED_SORT_EXACT_URL_FIRST, state);

  if (isLoadingStore) return null;
  return (
    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 dark:text-zinc-300">
      <div
        className={classNames(
          "relative space-y-4 bg-white dark:bg-gray-800 p-6 scrollbar scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-200 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-600",
          scrollable ? "min-h-[40vh] max-h-[80vh]" : ""
        )}
      >
        <div className="text-lg font-medium">Customise your Results</div>
        <div className="flex flex-col space-y-2">
          <div>Sort Results by</div>
          <SelectMenu
            options={RESULT_FEED_SORT_OPTIONS}
            defaultOption={resultFeedSortOption}
            onSelected={setResultFeedSortOption}
          />
        </div>
        <div
          data-tip="Results that contains an exact link to your current page are sorted first."
          className="flex flex-row items-center space-x-2"
        >
          <div>
            <div className="mr-1 inline">
              Sort Results with Exact URL Match first
            </div>
            <QuestionMarkCircleIcon className="inline h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="grow" />
          <Toggle
            checked={resultFeedSortExactUrlFirst}
            onCheck={setResultFeedSortExactUrlFirst}
          />
        </div>
      </div>

      <ReactTooltip place="top" type="dark" effect="solid" />
    </div>
  );
};
