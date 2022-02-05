import React from "react";
import { ProviderResults } from "../providers/providers";
import {
  ChevronRightIcon,
  CogIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/outline";
import hackerNewsLogo from "../assets/hackernews_icon.png";
import redditLogo from "../assets/reddit_icon.png";

import ResultCard from "./ResultCard";

interface Props {
  providerData: ProviderResults;
  onClose: () => void;
}

const SideBar = (props: Props) => {
  const { providerData, onClose } = props;
  return (
    <div className="h-full w-96 fixed bottom-0 right-0 z-[2000000000] bg-slate-100 flex flex-col">
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
            <img
              alt="Hacker News Icon"
              className="my-auto h-4 w-4"
              src={chrome.runtime.getURL(hackerNewsLogo)}
            />
            <p className="my-1 text-slate-500">Hacker News</p>
          </div>
          {providerData.hackerNews.map((result, index) => (
            <ResultCard key={index} result={result} />
          ))}
        </div>
        <div className="space-y-2">
          <div className="align-bottom space-x-2 flex flex-row">
            <img
              alt="Reddit Icon"
              className="my-auto h-5 w-5"
              src={chrome.runtime.getURL(redditLogo)}
            />
            <p className="my-1 text-slate-500">Reddit</p>
          </div>
          {providerData.reddit.map((result, index) => (
            <ResultCard key={index} result={result} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SideBar;