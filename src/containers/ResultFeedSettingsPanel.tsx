import { QuestionMarkCircleIcon } from "@heroicons/react/outline";
import _ from "lodash";
import React from "react";
import ReactTooltip from "react-tooltip";

import {
  KEY_INCOGNITO_MODE,
  KEY_RESULT_FEED_FILTER_BY_MIN_COMMENTS,
  KEY_RESULT_FEED_FILTER_BY_MIN_DATE,
  KEY_RESULT_FEED_FILTER_BY_MIN_LIKES,
  KEY_RESULT_FEED_SORT_EXACT_URL_FIRST,
  KEY_RESULT_FEED_SORT_OPTION,
  SETTINGS_DEBOUNCE_TIME,
} from "../shared/constants";
import { EventType, sendEventsToServerViaWorker } from "../shared/events";
import {
  RESULT_FEED_FILTER_BY_MIN_DATE_OPTIONS,
  RESULT_FEED_SORT_OPTIONS,
} from "../shared/options";
import { useSettingsStore } from "../shared/settings";
import { classNames } from "../utils/classNames";
import { log } from "../utils/log";
import SelectMenu from "./SelectMenu";
import Slider from "./Slider";
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
  const resultFeedFilterByMinComments =
    settings[KEY_RESULT_FEED_FILTER_BY_MIN_COMMENTS];
  const resultFeedFilterByMinLikes =
    settings[KEY_RESULT_FEED_FILTER_BY_MIN_LIKES];
  const resultFeedFilterByMinDate =
    settings[KEY_RESULT_FEED_FILTER_BY_MIN_DATE];

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

  const setResultFeedFilterByMinComments = (state: number) =>
    setKeyValueWithEvents(KEY_RESULT_FEED_FILTER_BY_MIN_COMMENTS, state);
  const setResultFeedFilterByMinLikes = (state: number) =>
    setKeyValueWithEvents(KEY_RESULT_FEED_FILTER_BY_MIN_LIKES, state);
  const setResultFeedFilterByMinDate = (state: any) =>
    setKeyValueWithEvents(KEY_RESULT_FEED_FILTER_BY_MIN_DATE, state);

  const setResultFeedFilterByMinCommentsDebounced = _.debounce((value: any) => {
    setResultFeedFilterByMinComments(value);
  }, SETTINGS_DEBOUNCE_TIME);
  const setResultFeedFilterByMinLikesDebounced = _.debounce((value: any) => {
    setResultFeedFilterByMinLikes(value);
  }, SETTINGS_DEBOUNCE_TIME);

  if (isLoadingStore) return null;
  return (
    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 dark:text-zinc-300">
      <div
        className={classNames(
          "relative space-y-5 bg-white dark:bg-gray-800 p-6 pb-32 scrollbar scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-200 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-600",
          scrollable ? "max-h-[80vh]" : ""
        )}
      >
        <div className="text-lg font-medium">Customise your Results</div>
        <div className="pt-2 text-base font-medium">Sorting</div>
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
        <div className="pt-5 text-base font-medium">Filtering</div>
        <div className="flex flex-col space-y-2">
          <div>Filter by Date</div>
          <SelectMenu
            options={RESULT_FEED_FILTER_BY_MIN_DATE_OPTIONS}
            defaultOption={resultFeedFilterByMinDate}
            onSelected={setResultFeedFilterByMinDate}
          />
        </div>
        <div className="space-y-2">
          <div className="flex flex-row">
            <div>Minimum Comment Counts</div>
            <div className="grow" />
            <div className="text-slate-600">
              {resultFeedFilterByMinComments}
            </div>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            defaultValue={[resultFeedFilterByMinComments]}
            onValueChange={setResultFeedFilterByMinCommentsDebounced}
          />
        </div>
        <div className="space-y-2">
          <div className="flex flex-row">
            <div>Minimum Like Counts</div>
            <div className="grow" />
            <div className="text-slate-600 font-medium">
              {resultFeedFilterByMinLikes}
            </div>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            defaultValue={[resultFeedFilterByMinLikes]}
            onValueChange={setResultFeedFilterByMinLikesDebounced}
          />
        </div>
      </div>

      <ReactTooltip place="top" type="dark" effect="solid" />
    </div>
  );
};
