import React, { useEffect, useState } from 'react';
import {
  ChevronRightIcon,
  CogIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/outline';

import './Sidebar.css';
import { ProviderResults, ProviderResultType } from '../../providers/providers';
import { log } from '../../utils/log';
import ResultCard from '../../containers/ResultCard';

const Sidebar = () => {
  console.log('============ IM in Sidebar ============');
  const [providerData, setProviderData] = useState<ProviderResults>({
    resultType: ProviderResultType.Ok,
    hackerNews: [],
    reddit: [],
  });

  useEffect(() => {
    log.debug('Sending message about the window URL');
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // since only one tab should be active and in the current window at once
      // the return variable should only have one entry
      const activeTab = tabs[0];
      const activeTabUrl = activeTab.url; // or do whatever you need

      log.debug('Active url', activeTabUrl);
      chrome.runtime.sendMessage(
        { windowUrl: activeTabUrl },
        (response: ProviderResults) => {
          log.debug('Printing provider data from background script...');
          log.debug(response);
          setProviderData(response);
        }
      );
    });
  }, [setProviderData]);

  const onClose = () => {
    // Send a message to the extension (alternative: use redux?) to close
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, {closeSideBar: true})
      }
    });};
  const onCardClick = () => {};
  const setClickedUrl = () => {};

  return (
    <div className="h-full w-full flex flex-row">
      {/*{clickedUrl && (*/}
      {/*  <div className="h-full w-[50vw] bg-slate-100 flex flex-col">*/}
      {/*    Hi*/}
      {/*    /!*<iframe src={clickedUrl} title="Selected Article" />*!/*/}
      {/*  </div>*/}
      {/*)}*/}
      <div className="h-screen w-full bg-slate-100 flex flex-col">
        <div className="px-2 space-x-2 items-center text-sm h-10 shrink-0 bg-white border border-slate-300 flex flex-row">
          <div className="cursor-pointer" onClick={onClose}>
            <ChevronRightIcon className="h-4 w-4 text-slate-500" />
          </div>
          <div className="grow" />
          <div className="cursor-pointer">
            <CogIcon className="h-5 w-5 text-slate-500" />
          </div>
          <div className="cursor-pointer">
            <QuestionMarkCircleIcon className="h-5 w-5 text-slate-500" />
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
