import React from "react";
import { ResultItem } from "../providers/providers";
import { ChatIcon, ThumbUpIcon } from "@heroicons/react/solid";

interface Props {
  result: ResultItem;
  onCardClick: (url: string) => void;
}

const ResultCard = (props: Props) => {
  const { result, onCardClick } = props;
  return (
    <div
      className="flex cursor-pointer flex-col space-y-2 rounded border border-slate-300 bg-white p-3"
      onClick={() => onCardClick(result.commentsLink)}
    >
      {result.subSourceName !== "" && (
        <div className="flex flex-row space-x-1">
          <div className="text-md font-medium text-slate-500 hover:underline">
            <a
              href={result.subSourceLink}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
            >
              {result.subSourceName}
            </a>
          </div>
        </div>
      )}
      <div className="text-md font-medium text-blue-800 hover:underline">
        <a
          href={result.commentsLink}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          {result.submittedTitle}
        </a>
      </div>
      <div className="flex flex-row space-x-3 text-xs">
        <div className="flex flex-row space-x-1">
          <strong className="text-slate-500">{result.submittedUpvotes}</strong>
          <ThumbUpIcon className="mt-0.5 h-3 w-3 text-slate-300" />
        </div>
        <div className="flex flex-row space-x-1">
          <strong className="text-slate-500">{result.commentsCount}</strong>
          <ChatIcon className="mt-0.5 h-3 w-3 text-slate-300" />
        </div>
        <div className="text-slate-600">{result.submittedDate}</div>
        <div className="grow" />
        <div className="text-[10px] text-slate-600 hover:underline">
          <a
            href={result.submittedByLink}
            target="_blank"
            onClick={(e) => e.stopPropagation()}
          >
            {result.submittedBy}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
