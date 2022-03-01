import { Popover, Transition } from "@headlessui/react";
import {
  ChevronRightIcon,
  CogIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/outline";
import React, { Fragment, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import ReactTooltip from "react-tooltip";

import { HelpPanel } from "../../containers/HelpPanel";
import ResultsContainer from "../../containers/ResultsContainer";
import { SettingsPanel } from "../../containers/SettingsPanel";
import {
  AllProviderResults,
  ProviderResultType,
  SingleProviderResults,
} from "../../providers/providers";
import {
  DEFAULT_HOTKEYS_CLOSE_SIDEBAR,
  KEY_HOTKEYS_TOGGLE_SIDEBAR,
  KEY_INCOGNITO_MODE,
} from "../../shared/constants";
import { useSettingsStore } from "../../shared/settings";
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
    <div className="text-center text-base font-semibold">No discussions</div>
    <div className="text-center text-slate-500">
      We can't find any relevant discussions on this web page, try going to a
      different web page.
    </div>
  </>
);

const Sidebar = () => {
  log.debug("Sidebar re-render");

  const [providerData, setProviderData] = useState<ProviderResults>({
    resultType: ProviderResultType.Ok,
    hackerNews: [],
    reddit: [],
  });
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

  const hotkeysToggleSidebar = settings[KEY_HOTKEYS_TOGGLE_SIDEBAR];

  // Handles message from background script that our URL changed.
  // We receive this message only when we are in a SPA and the link changes without full-page reload.
  // Full-page reload will hit the useEffect instead.
  const handleMessage = (request: any, sender: any, sendResponse: any) => {
    log.debug("Content script received message that our tab's URL changed.");
    // A SPA-like page change happened so we should allow incog users to request new data.
    if (request.changedUrl) {
      // For incognito to know to show the click-to-call-api overlay
      setHasFetchedDataForThisPage(false);
      // To tell button to not display (no results yet)
      sendMessageToCurrentTab({
        newProviderDataCount: 0,
        loadingProviderData: false,
      });
    }

    if (
      request.changedUrl &&
      !isLoadingStore &&
      !settings[KEY_INCOGNITO_MODE]
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
      { getProviderData: true, documentTitle: document.title },
      (allProviderResults: AllProviderResults) => {
        // Received results from providers
        setIsLoadingProviderData(false);
        setHasFetchedDataForThisPage(true);
        log.debug("Printing provider data from background script...");
        log.debug(allProviderResults);
        setProviderData(allProviderResults);
        // Inform content script about how much new data there is
        const numResults = allProviderResults.providerResults
          .map((v: SingleProviderResults) => v.results.length)
          .reduce((a, b) => a + b, 0);
        sendMessageToCurrentTab({
          newProviderDataCount: numResults,
          loadingProviderData: false,
        });
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
    chrome.runtime.onMessage.addListener(handleMessage);

    // Update provider info ONLY IF we are not incognito
    if (!isLoadingStore && !settings[KEY_INCOGNITO_MODE]) {
      updateProviderData();
    }

    // Remove listener when this component unmounts
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, [settings[KEY_INCOGNITO_MODE], isLoadingStore]);

  // Send a message to the extension (alternative: use redux?) to close
  const closeSideBar = () => sendMessageToCurrentTab({ closeSideBar: true });
  const toggleSideBar = () => sendMessageToCurrentTab({ toggleSideBar: true });

  // Hotkeys to control the sidebar visibility.
  // Note: The SideBar is reimplementing the same hotkey shortcuts because it will be within an iFrame
  useHotkeys(hotkeysToggleSidebar.join(","), toggleSideBar);
  useHotkeys(DEFAULT_HOTKEYS_CLOSE_SIDEBAR.join(","), closeSideBar);

  const noDiscussions =
    providerData.hackerNews.length === 0 && providerData.reddit.length === 0;

  // Must be incognito mode, no data fetched so far (click option to fetch), and not already loading results
  const shouldDisplayIncognitoOverlay =
    settings[KEY_INCOGNITO_MODE] &&
    hasFetchedDataForThisPage == false &&
    isLoadingProviderData === false;

  return (
    <div className="flex h-full w-full flex-row">
      {isLoadingProviderData && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-gray-700 opacity-75">
          <div className="loader mb-4 h-12 w-12 rounded-full border-4 border-t-4 ease-linear" />
          <h2 className="text-center text-xl font-semibold text-white">
            Loading discussions...
          </h2>
        </div>
      )}

      {/*{clickedUrl && (*/}
      {/*  <div className="h-full w-[50vw] bg-slate-100 flex flex-col">*/}
      {/*    Hi*/}
      {/*    /!*<iframe src={clickedUrl} title="Selected Article" />*!/*/}
      {/*  </div>*/}
      {/*)}*/}
      <div className="flex h-screen w-full flex-col border-x border-b border-slate-300 bg-slate-100">
        <div className="shrink-0 items-end border-b border-slate-300 bg-white pt-2 pb-1">
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
            <div className="grow" />
            <Popover className="relative">
              {({ open }) => (
                <>
                  <Popover.Button>
                    <CogIcon className="h-5 w-5 text-slate-500" />
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
                    <Popover.Panel className="absolute -right-8 z-30 mt-3 w-screen max-w-xs transform px-4 sm:px-0 lg:max-w-3xl">
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
                    <QuestionMarkCircleIcon className="h-5 w-5 text-slate-500" />
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
                    <Popover.Panel className="absolute right-0 z-30 mt-3 w-screen max-w-xs transform px-4 sm:px-0 lg:max-w-3xl">
                      <HelpPanel />
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
          </div>
        </div>
        <div className="grow scrollbar scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-200">
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
            <p className="text-lg text-indigo-600">Discussions</p>
            {noDiscussions ? (
              <EmptyDiscussionsState />
            ) : (
              <div className="space-y-4 py-1">
                <div className="space-y-2">
                  {providerData.hackerNews.length > 0 && (
                    <div className="flex flex-row space-x-2 align-bottom">
                      <img
                        alt="Hacker News Icon"
                        className="my-auto h-4 w-4"
                        src={chrome.runtime.getURL("hackernews_icon.png")}
                      />
                      <p className="my-1 text-slate-500">Hacker News</p>
                    </div>
                  )}
                  <ResultsContainer results={providerData.hackerNews} />
                </div>
                <div className="space-y-2">
                  {providerData.reddit.length > 0 && (
                    <div className="flex flex-row space-x-2 align-bottom">
                      <img
                        alt="Reddit Icon"
                        className="my-auto h-5 w-5"
                        src={chrome.runtime.getURL("reddit_icon.png")}
                      />
                      <p className="my-1 text-slate-500">Reddit</p>
                    </div>
                  )}
                  <ResultsContainer results={providerData.reddit} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
