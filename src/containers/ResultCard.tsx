import { ChatIcon, ThumbUpIcon } from "@heroicons/react/solid";
import React from "react";

import { ResultItem } from "../providers/providers";
import {
  COLOR_IF_OUTSIDE_HASH,
  KEY_BOLD_INITIAL_CHARS_OF_WORDS,
  KEY_FONT_SIZES,
  KEY_SHOULD_COLOR_FOR_SUBMITTED_BY,
} from "../shared/constants";
import { EventType, sendEventsToServerViaWorker } from "../shared/events";
import { useSettingsStore } from "../shared/settings";
import { hashStringToColor } from "../utils/color";
import { boldFrontPortionOfWords } from "../utils/formatText";

interface Props {
  cardPosition: number;
  result: ResultItem;
}

const logForumResultEvent = (
  eventType: EventType,
  cardPosition: number,
  result: ResultItem
) => {
  sendEventsToServerViaWorker({
    eventType,
    resultCardPosition: cardPosition,
    resultSubmittedUrl: result.submittedUrl,
    resultSubmittedDate: result.submittedDate,
    resultSubmittedUpvotes: result.submittedUpvotes,
    resultSubmittedTitle: result.submittedTitle,
    resultSubmittedBy: result.submittedBy,
    resultSubmittedByLink: result.submittedByLink,
    resultCommentsCount: result.commentsCount,
    resultCommentsLink: result.commentsLink,
    resultSubSourceName: result.subSourceName,
    resultSubSourceLink: result.subSourceLink,
  });
};

const ResultCard = (props: Props) => {
  const { result, cardPosition } = props;
  const [
    settings,
    setValueAll,
    setKeyValue,
    isPersistent,
    error,
    isLoadingStore,
  ] = useSettingsStore();

  const onCardClick = (url: string) => {
    window.open(url, "_blank");
  };

  const boldInitialCharsOfWords = settings[KEY_BOLD_INITIAL_CHARS_OF_WORDS];
  const fontSizes = settings[KEY_FONT_SIZES];
  const colorForSubmittedBy = settings[KEY_SHOULD_COLOR_FOR_SUBMITTED_BY]
    ? hashStringToColor(result.submittedBy)
    : COLOR_IF_OUTSIDE_HASH;

  return (
    <div
      className="flex cursor-pointer flex-col space-y-2 p-3"
      onClick={() => {
        logForumResultEvent(
          EventType.CLICK_SIDEBAR_FORUM_RESULT_TITLE,
          cardPosition,
          result
        );
        onCardClick(result.commentsLink);
      }}
    >
      {result.subSourceName !== "" && (
        <div className="flex flex-row space-x-1">
          <div
            className={`${fontSizes.subText} font-medium text-indigo-500 hover:underline`}
          >
            <a
              href={result.subSourceLink}
              target="_blank"
              onClick={(e) => {
                logForumResultEvent(
                  EventType.CLICK_SIDEBAR_FORUM_RESULT_SUB_SOURCE,
                  cardPosition,
                  result
                );
                e.stopPropagation();
              }}
            >
              {result.subSourceName}
            </a>
          </div>
        </div>
      )}
      <div
        className={`${fontSizes.mainText} font-normal text-black space-x-2 hover:underline`}
      >
        <img
          alt="Source Icon"
          className="inline h-4 w-4"
          src={chrome.runtime.getURL(result.sourceIconUrl)}
        />
        <a
          href={result.commentsLink}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => {
            logForumResultEvent(
              EventType.CLICK_SIDEBAR_FORUM_RESULT_TITLE,
              cardPosition,
              result
            );
            e.stopPropagation();
          }}
        >
          {boldInitialCharsOfWords
            ? boldFrontPortionOfWords(result.submittedTitle)
            : result.submittedTitle}
        </a>
      </div>
      <div className={`${fontSizes.subText} flex flex-row flex-wrap space-x-3`}>
        <div className="flex flex-row items-center space-x-1">
          <strong className="text-slate-500">{result.commentsCount}</strong>
          <ChatIcon className="h-3 w-3 text-slate-300" />
        </div>
        <div className="flex flex-row items-center space-x-1">
          <strong className="text-slate-500">{result.submittedUpvotes}</strong>
          <ThumbUpIcon className="h-3 w-3 text-slate-300" />
        </div>
        <div className="text-slate-600">{result.submittedDate}</div>
        <div className="grow" />
        <div className={`text-[11px] ${colorForSubmittedBy} hover:underline`}>
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
