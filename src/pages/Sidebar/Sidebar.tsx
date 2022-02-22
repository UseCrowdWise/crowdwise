import React, { Fragment, useEffect, useState } from "react";
import { Popover, Transition } from "@headlessui/react";
import {
  ChevronRightIcon,
  CogIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/outline";

import { ProviderResults, ProviderResultType } from "../../providers/providers";
import { log } from "../../utils/log";
import ResultCard from "../../containers/ResultCard";
import { useHotkeys } from "react-hotkeys-hook";
import { sendMessageToActiveTab } from "../../utils/tabs";
import {
  DEFAULT_HOTKEYS_CLOSE_SIDEBAR,
  DEFAULT_HOTKEYS_TOGGLE_SIDEBAR,
  KEY_HOTKEYS_TOGGLE_SIDEBAR,
} from "../../shared/constants";
import { SettingsPanel } from "../../containers/SettingsPanel";
import { useChromeStorage } from "../../shared/useChromeStorage";

const Sidebar = () => {
  log.debug("Sidebar re-render");

  const [providerData, setProviderData] = useState<ProviderResults>({
    resultType: ProviderResultType.Ok,
    hackerNews: [],
    reddit: [],
  });

  const [hotkeysToggleSidebar, setHotkeysToggleSidebar] = useChromeStorage(
    KEY_HOTKEYS_TOGGLE_SIDEBAR,
    DEFAULT_HOTKEYS_TOGGLE_SIDEBAR,
    []
  );

  useEffect(() => {
    log.debug("Sending message about the window URL");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // since only one tab should be active and in the current window at once
      // the return variable should only have one entry
      const activeTab = tabs[0];
      const activeTabUrl = activeTab.url; // or do whatever you need

      log.debug("Active url", activeTabUrl);
      chrome.runtime.sendMessage(
        { windowUrl: activeTabUrl },
        (response: ProviderResults) => {
          log.debug("Printing provider data from background script...");
          log.debug(response);
          setProviderData(response);
        }
      );
    });
  }, [setProviderData]);

  const onCardClick = () => {};
  const setClickedUrl = () => {};

  // Send a message to the extension (alternative: use redux?) to close
  const closeSideBar = () => sendMessageToActiveTab({ closeSideBar: true });
  const toggleSideBar = () => sendMessageToActiveTab({ toggleSideBar: true });

  // Hotkeys to control the sidebar visibility.
  // Note: The SideBar is reimplementing the same hotkey shortcuts because it will be within an iFrame
  useHotkeys(hotkeysToggleSidebar.join(","), toggleSideBar);
  useHotkeys(DEFAULT_HOTKEYS_CLOSE_SIDEBAR.join(","), closeSideBar);

  return (
    <div className="h-full w-full flex flex-row">
      {/*{clickedUrl && (*/}
      {/*  <div className="h-full w-[50vw] bg-slate-100 flex flex-col">*/}
      {/*    Hi*/}
      {/*    /!*<iframe src={clickedUrl} title="Selected Article" />*!/*/}
      {/*  </div>*/}
      {/*)}*/}
      <div className="h-screen w-full bg-slate-100 border-b border-x border-slate-300 flex flex-col">
        <div className="pt-3 pb-2 shrink-0 items-end bg-white border-b border-slate-300 ">
          <div className="px-2 space-x-2 text-md flex flex-row">
            <div className="cursor-pointer" onClick={closeSideBar}>
              <ChevronRightIcon className="h-4 w-4 text-slate-500" />
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
                    <Popover.Panel className="absolute z-10 w-screen max-w-xs px-4 mt-3 transform right-0 sm:px-0 lg:max-w-3xl">
                      <SettingsPanel />
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
            <div className="cursor-pointer">
              <QuestionMarkCircleIcon className="h-5 w-5 text-slate-500" />
            </div>
          </div>
        </div>
        <div className="text-left p-3 space-y-3 scrollbar scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-slate-100 grow">
          <p className="text-lg text-blue-700">Backlinks</p>
          <div className="space-y-2">
            <div className="align-bottom space-x-2 flex flex-row">
              {/*<img*/}
              {/*  alt="Hacker News Icon"*/}
              {/*  className="my-auto h-4 w-4"*/}
              {/*  // src={hackerNewsLogo}*/}
              {/*  src={chrome.runtime.getURL(hackerNewsLogo)}*/}
              {/*/>*/}
              <p className="my-1 text-slate-500">Hacker News</p>
            </div>
            {providerData.hackerNews.map((result, index) => (
              <ResultCard
                key={index}
                result={result}
                onCardClick={onCardClick}
              />
            ))}
          </div>
          <div className="space-y-2">
            <div className="align-bottom space-x-2 flex flex-row">
              {/*<img*/}
              {/*  alt="Reddit Icon"*/}
              {/*  className="my-auto h-5 w-5"*/}
              {/*  // src={redditLogo}*/}
              {/*  src={chrome.runtime.getURL(redditLogo)}*/}
              {/*/>*/}
              <p className="my-1 text-slate-500">Reddit</p>
            </div>
            {providerData.reddit.map((result, index) => (
              <ResultCard
                key={index}
                result={result}
                onCardClick={setClickedUrl}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
