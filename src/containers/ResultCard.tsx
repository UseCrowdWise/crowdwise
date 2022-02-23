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
      onClick={() => onCardClick(result.comments_link)}
    >
      {result.sub_source_name !== "" && (
        <div className="flex flex-row space-x-1">
          <div className="text-md font-medium text-slate-500 hover:underline">
            <a
              href={result.sub_source_link}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
            >
              {result.sub_source_name}
            </a>
          </div>
        </div>
      )}
      <div className="text-md font-medium text-blue-800 hover:underline">
        <a href={result.comments_link} target="_blank" rel="noreferrer">
          {result.submitted_title}
        </a>
      </div>
      <div className="flex flex-row space-x-3 text-xs">
        <div className="flex flex-row space-x-1">
          <strong className="text-slate-500">{result.submitted_upvotes}</strong>
          <ThumbUpIcon className="mt-0.5 h-3 w-3 text-slate-300" />
        </div>
        <div className="flex flex-row space-x-1">
          <strong className="text-slate-500">{result.comments_count}</strong>
          <ChatIcon className="mt-0.5 h-3 w-3 text-slate-300" />
        </div>
        <div className="text-slate-600">{result.submitted_date}</div>
        <div className="grow" />
        <div className="text-[10px] text-slate-600 hover:underline">
          <a
            href={result.submitted_by_link}
            target="_blank"
            onClick={(e) => e.stopPropagation()}
          >
            {result.submitted_by}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
