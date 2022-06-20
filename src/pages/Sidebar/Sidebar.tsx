import { Popover, Transition } from "@headlessui/react";
import {
  BeakerIcon,
  ChevronRightIcon,
  CogIcon,
  LightBulbIcon,
  LightningBoltIcon,
  MoonIcon,
  QuestionMarkCircleIcon,
  SearchIcon,
} from "@heroicons/react/outline";
import { differenceInDays } from "date-fns";
import { parseISO } from "date-fns";
import React, { Fragment, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import ReactTooltip from "react-tooltip";

import { HelpPanel } from "../../containers/HelpPanel";
import { ResultFeedSettingsPanel } from "../../containers/ResultFeedSettingsPanel";
import ResultsContainer from "../../containers/ResultsContainer";
import { SettingsPanel } from "../../containers/SettingsPanel";
import {
  AllProviderResults,
  ProviderQueryType,
  ProviderType,
  ResultItem,
} from "../../providers/providers";
import {
  DEFAULT_HOTKEYS_CLOSE_SIDEBAR,
  KEY_HOTKEYS_TOGGLE_SIDEBAR,
  KEY_INCOGNITO_MODE,
  KEY_IS_DARK_MODE,
  KEY_IS_DEBUG_MODE,
  KEY_RESULT_FEED_FILTER_BY_MIN_COMMENTS,
  KEY_RESULT_FEED_FILTER_BY_MIN_DATE,
  KEY_RESULT_FEED_FILTER_BY_MIN_LIKES,
  KEY_RESULT_FEED_SORT_EXACT_URL_FIRST,
  KEY_RESULT_FEED_SORT_OPTION,
  ML_FILTER_THRESHOLD,
  SHOULD_SHOW_DEBUG_BUTTON,
  SLACK_INVITE_LINK,
} from "../../shared/constants";
import { EventType, sendEventsToServerViaWorker } from "../../shared/events";
import { FilterDateOption, SortOption } from "../../shared/options";
import { useSettingsStore } from "../../shared/settings";
import { classNames } from "../../utils/classNames";
import { log } from "../../utils/log";
import { sendMessageToCurrentTab } from "../../utils/tabs";
import "./Sidebar.css";

const EmptyDiscussionsState = () => (
  <>
    <img
      alt="Online discussions"
      className="mx-auto w-3/4 p-4 opacity-80"
      src={chrome.runtime.getURL("undraw_group_chat.svg")}
    />
    <div className="text-center text-base dark:text-zinc-300 font-semibold">
      No discussions
    </div>
    <div className="text-center text-slate-500 dark:text-slate-400">
      We can't find any relevant discussions on this web page, try going to a
      different web page or searching on Google.
    </div>
  </>
);

const selectSortFunction = (
  sortOption: SortOption,
  sortExactUrlFirst: boolean
) => {
  const _exactUrlComparison = (x: ResultItem, y: ResultItem) => {
    return sortExactUrlFirst
      ? Number(y.providerQueryType === ProviderQueryType.EXACT_URL) -
          Number(x.providerQueryType === ProviderQueryType.EXACT_URL)
      : 0;
  };
  const _selectedComparison = {
    "highest-comments": (x: ResultItem, y: ResultItem) => {
      return y.commentsCount - x.commentsCount;
    },
    "lowest-comments": (x: ResultItem, y: ResultItem) => {
      return x.commentsCount - y.commentsCount;
    },
    "highest-likes": (x: ResultItem, y: ResultItem) => {
      return y.submittedUpvotes - x.submittedUpvotes;
    },
    "lowest-likes": (x: ResultItem, y: ResultItem) => {
      return x.submittedUpvotes - y.submittedUpvotes;
    },
    newest: (x: ResultItem, y: ResultItem) => {
      return (
        parseISO(y.submittedDate).getTime() -
        parseISO(x.submittedDate).getTime()
      );
    },
    oldest: (x: ResultItem, y: ResultItem) => {
      return (
        parseISO(x.submittedDate).getTime() -
        parseISO(y.submittedDate).getTime()
      );
    },
  }[sortOption];
  return (x: ResultItem, y: ResultItem) =>
    _exactUrlComparison(x, y) || _selectedComparison(x, y);
};

const filterResults = (
  results: ResultItem[],
  filterByDate: FilterDateOption,
  filterByMinCommentCounts: number,
  filterByMinLikeCounts: number
) => {
  return results.filter((result) => {
    // Filter by relevance
    const passRelevanceFilter = result.relevanceScore
      ? result.relevanceScore > ML_FILTER_THRESHOLD
      : true;

    // Filter by dates
    const daysDiffBetweenNowAndResult = differenceInDays(
      new Date(),
      parseISO(result.submittedDate)
    );

    const passDateFilter = {
      all: true,
      "1-week": daysDiffBetweenNowAndResult - 7 <= 0,
      "1-month": daysDiffBetweenNowAndResult - 30 <= 0,
      "3-months": daysDiffBetweenNowAndResult - 90 <= 0,
      "6-months": daysDiffBetweenNowAndResult - 180 <= 0,
      "1-year": daysDiffBetweenNowAndResult - 365 <= 0,
    }[filterByDate];

    // Filter by comments count
    const passCommentCountsFilter =
      result.commentsCount >= filterByMinCommentCounts;

    // Filter by likes count
    const passLikeCountsFilter =
      result.submittedUpvotes >= filterByMinLikeCounts;
    return (
      passRelevanceFilter &&
      passDateFilter &&
      passCommentCountsFilter &&
      passLikeCountsFilter
    );
  });
};

const sortAndFilterResults = (
  providerData: AllProviderResults | undefined,
  sortOption: SortOption,
  sortExactUrlFirst: boolean,
  filterByDate: FilterDateOption,
  filterByMinCommentCounts: number,
  filterByMinLikeCounts: number,
  isDebugMode: boolean
) => {
  const hnResults =
    providerData?.providerResults[ProviderType.HACKER_NEWS] || {};
  const redditResults =
    providerData?.providerResults[ProviderType.REDDIT] || {};

  const sortFunction = selectSortFunction(sortOption, sortExactUrlFirst);

  // Combining results from different sources
  const allResults = (hnResults[ProviderQueryType.EXACT_URL] ?? [])
    .concat(redditResults[ProviderQueryType.EXACT_URL] ?? [])
    .concat(hnResults[ProviderQueryType.TITLE] ?? [])
    .concat(redditResults[ProviderQueryType.TITLE] ?? [])
    .sort(sortFunction);

  // In debug mode, we want to see all results
  return isDebugMode
    ? allResults
    : filterResults(
        allResults,
        filterByDate,
        filterByMinCommentCounts,
        filterByMinLikeCounts
      );
};

const debugResults = (providerData: AllProviderResults | undefined) => {
  // More UI display conditional variables
  const hnResults =
    providerData?.providerResults[ProviderType.HACKER_NEWS] || {};
  const redditResults =
    providerData?.providerResults[ProviderType.REDDIT] || {};

  // Split results into the different sources when under debug mode
  const haveHnExactResults = hnResults[ProviderQueryType.EXACT_URL]?.length > 0;
  const haveRedditExactResults =
    redditResults[ProviderQueryType.EXACT_URL]?.length > 0;
  log.debug(
    `Have HN exact: ${haveHnExactResults}, have Reddit exact: ${haveRedditExactResults}`
  );
  const haveHnTitleResults = hnResults[ProviderQueryType.TITLE]?.length > 0;
  const haveRedditTitleResults =
    redditResults[ProviderQueryType.TITLE]?.length > 0;

  return {
    haveHnExactResults,
    haveRedditExactResults,
    haveHnTitleResults,
    haveRedditTitleResults,
  };
};

const Sidebar = () => {
  log.debug("Sidebar re-render");

  const [providerData, setProviderData] = useState<AllProviderResults>();
  const [filteredResults, setFilteredResults] = useState<ResultItem[]>([]);
  const [isLoadingProviderData, setIsLoadingProviderData] =
    useState<boolean>(false);
  const [hasFetchedDataForThisPage, setHasFetchedDataForThisPage] =
    useState<boolean>(false);

  const [
    settings,
    setSettings,
    setKeyValue,
    isPersistent,
    error,
    isLoadingStore,
  ] = useSettingsStore();

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

  const isDebugMode = settings[KEY_IS_DEBUG_MODE];
  const isIncognitoMode = settings[KEY_INCOGNITO_MODE];
  const isDarkMode = settings[KEY_IS_DARK_MODE];
  const hotkeysToggleSidebar = settings[KEY_HOTKEYS_TOGGLE_SIDEBAR];

  const resultFeedSortExactUrlFirst =
    settings[KEY_RESULT_FEED_SORT_EXACT_URL_FIRST];
  const resultFeedSortOption = settings[KEY_RESULT_FEED_SORT_OPTION];
  const resultFeedFilterByMinDate =
    settings[KEY_RESULT_FEED_FILTER_BY_MIN_DATE];
  const resultFeedFilterByMinComments =
    settings[KEY_RESULT_FEED_FILTER_BY_MIN_COMMENTS];
  const resultFeedFilterByMinLikes =
    settings[KEY_RESULT_FEED_FILTER_BY_MIN_LIKES];
  // Make sure to update this list if we add more filters or we won't live update the feed
  const resultFeedSortFilters = [
    resultFeedSortExactUrlFirst,
    resultFeedSortOption,
    resultFeedFilterByMinDate,
    resultFeedFilterByMinComments,
    resultFeedFilterByMinLikes,
  ];

  // Handles message from background script that our URL changed.
  // We receive this message only when we are in a SPA and the link changes without full-page reload.
  // Full-page reload will hit the useEffect instead.
  const handleMessage = (request: any, sender: any, sendResponse: any) => {
    log.debug("Content script received message that our tab's URL changed.");
    // A SPA-like page change happened so we should allow incog users to request new data.
    if (request.changedUrl || request.changedTitle) {
      // For incognito to know to show the click-to-call-api overlay
      setHasFetchedDataForThisPage(false);
      // To tell button to not display (no results yet)
      sendMessageToCurrentTab({
        newProviderDataCount: 0,
        loadingProviderData: false,
      });
    }

    if (
      request.changedUrl ||
      (request.changedTitle && !isLoadingStore && !settings[KEY_INCOGNITO_MODE])
    ) {
      updateProviderData();
    }
  };

  // Actual call to update current results
  const updateProviderData = () => {
    setIsLoadingProviderData(true);
    setHasFetchedDataForThisPage(false);
    sendMessageToCurrentTab({
      loadingProviderData: true,
    });
    log.debug("Sending message to background script to update provider info.");
    chrome.runtime.sendMessage(
      { getProviderData: true },
      (allProviderResults: AllProviderResults) => {
        // Received results from providers
        setIsLoadingProviderData(false);
        setHasFetchedDataForThisPage(true);
        log.debug("Printing provider data from background script...");
        log.debug(allProviderResults);

        // Set all results before filtered and sorting
        // Another effect will handle this
        setProviderData(allProviderResults);
      }
    );
  };

  // When sidebar loads for the first time, ask for discussion data from providers.
  // We don't pass our URL to the background script. The script know what URL our tab is.
  // This avoids race conditions.
  useEffect(() => {
    log.debug(
      `Current incognito setting: ${
        settings[KEY_INCOGNITO_MODE]
      }, loading store? ${JSON.stringify(isLoadingStore)}`
    );
    // Add listener when component mounts
    if (!chrome.runtime.onMessage.hasListener(handleMessage)) {
      chrome.runtime.onMessage.addListener(handleMessage);
    }

    // Update provider info ONLY IF we are not incognito
    if (!isLoadingStore && !settings[KEY_INCOGNITO_MODE]) {
      updateProviderData();

      sendEventsToServerViaWorker(
        {
          eventType: EventType.LOAD_SIDEBAR,
        },
        isIncognitoMode
      );
    }

    // Remove listener when this component unmounts
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, [settings[KEY_INCOGNITO_MODE], isLoadingStore]);

  // Run side effect to filter results and update count on new results
  useEffect(() => {
    // Set filtered + one-list results for the sidebar
    const filteredResults = sortAndFilterResults(
      providerData,
      resultFeedSortOption.key,
      resultFeedSortExactUrlFirst,
      resultFeedFilterByMinDate.key,
      resultFeedFilterByMinComments,
      resultFeedFilterByMinLikes,
      isDebugMode
    );
    setFilteredResults(filteredResults);

    sendMessageToCurrentTab({
      newProviderDataCount: filteredResults.length,
      // TODO: potential bug - exact results in all provider results may be filtered out!
      newProviderExactDataCount: providerData?.numExactResults || 0,
      loadingProviderData: false,
    });
  }, [providerData, ...resultFeedSortFilters]);

  // Send a message to the extension (alternative: use redux?) to close
  const closeSideBar = () => {
    sendEventsToServerViaWorker(
      { eventType: EventType.CLOSE_SIDEBAR },
      isIncognitoMode
    );
    sendMessageToCurrentTab({ closeSideBar: true });
  };
  const toggleSideBar = () => {
    sendEventsToServerViaWorker(
      { eventType: EventType.TOGGLE_SIDEBAR },
      isIncognitoMode
    );
    sendMessageToCurrentTab({ toggleSideBar: true });
  };
  const openGoogleInNewTab = (googleUrl: string) => {
    sendEventsToServerViaWorker(
      {
        eventType: EventType.CLICK_SIDEBAR_SEARCH_ON_GOOGLE,
        redirectLink: googleUrl,
      },
      isIncognitoMode
    );
    window.open(googleUrl, "_blank");
  };

  // Hotkeys to control the sidebar visibility.
  // Note: The SideBar is reimplementing the same hotkey shortcuts because it will be within an iFrame
  useHotkeys(hotkeysToggleSidebar.join(","), toggleSideBar);
  useHotkeys(DEFAULT_HOTKEYS_CLOSE_SIDEBAR.join(","), closeSideBar);

  // Must be incognito mode, no data fetched so far (click option to fetch), and not already loading results
  const shouldDisplayIncognitoOverlay =
    settings[KEY_INCOGNITO_MODE] &&
    hasFetchedDataForThisPage == false &&
    isLoadingProviderData === false;

  const noDiscussions =
    filteredResults !== undefined ? filteredResults.length === 0 : true;
  const numFilteredResults =
    (providerData?.numResults || 0) - filteredResults.length;

  // Get results for debugging
  const {
    haveHnExactResults,
    haveRedditExactResults,
    haveHnTitleResults,
    haveRedditTitleResults,
  } = debugResults(providerData);

  // Query display
  const { searchExactUrl, searchTitle } = providerData?.queryInfo || {};
  const searchGoogleUrl =
    searchExactUrl &&
    "https://www.google.com/search?q=" + encodeURIComponent(searchExactUrl);

  console.log("Search Exact URL: " + searchExactUrl);
  return (
    <div
      className={classNames(
        "flex h-full w-full flex-row",
        isDarkMode ? "dark" : ""
      )}
    >
      {isLoadingProviderData && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-gray-700 opacity-75">
          <div className="loader mb-4 h-12 w-12 rounded-full border-4 border-t-4 ease-linear" />
          <h2 className="text-center text-xl font-semibold text-white">
            Loading discussions...
          </h2>
        </div>
      )}

      <div className="flex h-screen w-full flex-col border-x border-b border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900">
        <div className="shrink-0 items-end border-b border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 pt-2 pb-1">
          <div className="flex flex-row space-x-2 px-2">
            <div className="cursor-pointer" onClick={closeSideBar}>
              <p
                data-tip={hotkeysToggleSidebar
                  .join(", ")
                  .replaceAll("+", " + ")}
              >
                <ChevronRightIcon className="h-4 w-4 text-slate-500" />
              </p>
              <ReactTooltip place="right" type="dark" effect="solid" />
            </div>
            {SHOULD_SHOW_DEBUG_BUTTON && (
              <BeakerIcon
                className="h-5 w-5 text-slate-500 cursor-pointer"
                onClick={() =>
                  setKeyValueWithEvents(KEY_IS_DEBUG_MODE, !isDebugMode)
                }
              />
            )}
            <div className="grow" />
            <Popover className="relative">
              {({ open }) => (
                <>
                  <Popover.Button>
                    <CogIcon
                      className="h-5 w-5 text-slate-500"
                      onClick={() =>
                        sendEventsToServerViaWorker(
                          {
                            eventType: EventType.CLICK_SIDEBAR_SETTING_ICON,
                          },
                          isIncognitoMode
                        )
                      }
                    />
                  </Popover.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute -right-20 z-30 mt-3 w-screen max-w-xs transform px-4 sm:px-0 lg:max-w-3xl">
                      <SettingsPanel scrollable={true} />
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
            <Popover className="relative">
              {({ open }) => (
                <>
                  <Popover.Button>
                    <QuestionMarkCircleIcon
                      className="h-5 w-5 text-slate-500"
                      onClick={() =>
                        sendEventsToServerViaWorker(
                          {
                            eventType: EventType.CLICK_SIDEBAR_HELP_ICON,
                          },
                          isIncognitoMode
                        )
                      }
                    />
                  </Popover.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute -right-10 z-30 mt-3 w-screen max-w-xs transform px-4 sm:px-0 lg:max-w-3xl">
                      <HelpPanel />
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
            {isDarkMode ? (
              <LightBulbIcon
                className="h-5 w-5 text-slate-500 cursor-pointer"
                onClick={() =>
                  setKeyValueWithEvents(KEY_IS_DARK_MODE, !isDarkMode)
                }
              />
            ) : (
              <MoonIcon
                className="h-5 w-5 text-slate-500 cursor-pointer"
                onClick={() =>
                  setKeyValueWithEvents(KEY_IS_DARK_MODE, !isDarkMode)
                }
              />
            )}
            <div
              className="cursor-pointer"
              onClick={(_) => {
                sendEventsToServerViaWorker(
                  {
                    eventType: EventType.CLICK_SIDEBAR_SLACK_ICON,
                  },
                  isIncognitoMode
                );
                window.open(SLACK_INVITE_LINK, "_blank");
              }}
            >
              <img
                alt="Join Slack Community"
                className="h-4 w-4 mt-0.5"
                src={chrome.runtime.getURL("slack_icon.png")}
              />
            </div>
          </div>
        </div>
        <div className="grow scrollbar scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-200 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-600">
          {shouldDisplayIncognitoOverlay && (
            <div
              className="opacity-99 fixed z-20 flex h-screen w-full cursor-pointer flex-col items-center justify-center overflow-hidden bg-gray-700"
              onClick={updateProviderData}
            >
              <h2 className="text-center text-xl font-semibold text-white">
                Incognito mode. <br /> Click sidebar to fetch data.
              </h2>
            </div>
          )}

          <div className="space-y-3 p-3 text-left">
            <div className="flex flex-row align-middle">
              <div className="flex">
                <p className="text-xl pl-2 font-semibold text-indigo-600">
                  Discussions
                </p>
              </div>
              <div className="grow" />
            </div>

            {providerData && isDebugMode ? (
              <div className="space-y-6 py-1">
                {haveHnExactResults || haveRedditExactResults ? (
                  <div>
                    <div className="py-1 text-base">
                      Results for{" "}
                      <span
                        className="font-semibold text-indigo-600"
                        data-tip={searchExactUrl}
                      >
                        {`current page`}
                      </span>
                      <div
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        className="text-xs text-slate-500"
                      >
                        {" "}
                        ({searchExactUrl}){" "}
                      </div>
                    </div>
                    {haveHnExactResults && (
                      <div className="space-y-2">
                        <ResultsContainer
                          results={
                            providerData.providerResults[
                              ProviderType.HACKER_NEWS
                            ][ProviderQueryType.EXACT_URL]
                          }
                        />
                        <hr />
                      </div>
                    )}
                    {haveRedditExactResults && (
                      <div className="space-y-2">
                        <ResultsContainer
                          results={
                            providerData.providerResults[ProviderType.REDDIT][
                              ProviderQueryType.EXACT_URL
                            ]
                          }
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-1 text-base">
                    No results for{" "}
                    <span
                      className="font-semibold text-indigo-600"
                      data-tip={searchExactUrl}
                    >
                      {`current page`}
                    </span>
                    <div
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      className="text-xs text-slate-500"
                    >
                      {" "}
                      ({searchExactUrl}){" "}
                    </div>
                  </div>
                )}
                <hr />
                {haveHnTitleResults || haveRedditTitleResults ? (
                  <div>
                    <div className="py-1 text-base">
                      Results for{" "}
                      <span
                        className="font-semibold text-indigo-600"
                        data-tip={searchTitle}
                      >
                        {`current page title`}
                      </span>
                      <div
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        className="text-xs text-slate-500"
                      >
                        {" "}
                        ({searchTitle}){" "}
                      </div>
                    </div>
                    {haveHnTitleResults && (
                      <div className="space-y-2">
                        <ResultsContainer
                          results={
                            providerData.providerResults[
                              ProviderType.HACKER_NEWS
                            ][ProviderQueryType.TITLE]
                          }
                        />
                        <hr />
                      </div>
                    )}
                    {haveRedditTitleResults && (
                      <div className="space-y-2">
                        <ResultsContainer
                          results={
                            providerData.providerResults[ProviderType.REDDIT][
                              ProviderQueryType.TITLE
                            ]
                          }
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-1 text-base">
                    No results for{" "}
                    <span
                      className="font-semibold text-indigo-600"
                      data-tip={searchTitle}
                    >
                      {`current page title`}
                    </span>
                    <div
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      className="text-xs text-slate-500"
                    >
                      {" "}
                      ({searchTitle}){" "}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 py-1">
                <div>
                  {searchGoogleUrl && (
                    <a
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => openGoogleInNewTab(searchGoogleUrl)}
                      className="inline-flex flex-row cursor-pointer text-black dark:text-zinc-300 font-normal my-auto pl-2 hover:underline"
                    >
                      <SearchIcon
                        className="h-3 w-3 my-auto pr-0.5 text-slate-500 dark:text-zinc-300"
                        onClick={() =>
                          sendEventsToServerViaWorker(
                            {
                              eventType: EventType.CLICK_SIDEBAR_HELP_ICON,
                            },
                            isIncognitoMode
                          )
                        }
                      />
                      Google
                    </a>
                  )}
                  <div className="flex flex-row space-x-4">
                    <div className="pl-2 py-1 text-base dark:text-zinc-300">
                      <span className="font-semibold text-indigo-600">
                        {filteredResults.length}
                      </span>
                      {filteredResults.length > 1 ||
                      filteredResults.length === 0
                        ? " results found"
                        : " result found"}
                      <span className="ml-2 text-xs text-black dark:text-zinc-300 align-text-bottom">
                        ({numFilteredResults} filtered)
                      </span>
                    </div>
                    <div className="grow" />
                    <Popover className="relative my-auto pt-0.5 pr-2">
                      {({ open }) => (
                        <>
                          <Popover.Button>
                            <LightningBoltIcon
                              className="h-5 w-5 text-indigo-600 hover:fill-current"
                              onClick={() =>
                                sendEventsToServerViaWorker(
                                  {
                                    eventType:
                                      EventType.CLICK_SIDEBAR_RESULT_FEED_SETTING_ICON,
                                  },
                                  isIncognitoMode
                                )
                              }
                            />
                          </Popover.Button>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-1"
                          >
                            <Popover.Panel className="absolute -right-4 z-30 mt-3 w-screen max-w-xs transform px-4 sm:px-0 lg:max-w-3xl">
                              <ResultFeedSettingsPanel scrollable={true} />
                            </Popover.Panel>
                          </Transition>
                        </>
                      )}
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <ResultsContainer
                      numResults={1000}
                      results={filteredResults}
                    />
                  </div>
                </div>
              </div>
            )}

            {(noDiscussions || !providerData) && (
              <div className="text-center">
                <EmptyDiscussionsState />
                {searchGoogleUrl && (
                  <button
                    onClick={() => openGoogleInNewTab(searchGoogleUrl)}
                    className="inline-flex items-center mt-6 px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Search on Google
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <ReactTooltip place="right" type="dark" effect="solid" />
      </div>
    </div>
  );
};

export default Sidebar;
