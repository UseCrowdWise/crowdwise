import { ChatIcon, ThumbUpIcon } from "@heroicons/react/solid";
import React, { useState } from "react";
import ReactTooltip from "react-tooltip";

import {
  Comment,
  ProviderQueryType,
  ProviderType,
  ResultItem,
} from "../providers/providers";
import {
  COLOR_IF_OUTSIDE_HASH,
  KEY_BOLD_INITIAL_CHARS_OF_WORDS,
  KEY_FONT_SIZES,
  KEY_INCOGNITO_MODE,
  KEY_IS_DEBUG_MODE,
  KEY_SHOULD_COLOR_FOR_SUBMITTED_BY,
  KEY_SHOULD_USE_OLD_REDDIT_LINK,
  ML_FILTER_THRESHOLD,
} from "../shared/constants";
import {
  EventType,
  logForumResultEvent,
  sendEventsToServerViaWorker,
} from "../shared/events";
import { useSettingsStore as useSettingsStoreDI } from "../shared/settings";
import { classNames } from "../utils/classNames";
import { hashStringToColor } from "../utils/color";
import { boldFrontPortionOfWords } from "../utils/formatText";
import { getImageUrl } from "../utils/image";
import {
  onFetchComments as onFetchCommentsDI,
  replaceRedditLinksInResult,
} from "../utils/results";
import Badge from "./Badge";
import CardBottomBar from "./CardBottomBar";
import ResultCardComments from "./ResultCardComments";

interface Props {
  cardPosition: number;
  result: ResultItem;
  useSettingsStore?: () => any;
  onFetchComments?: (
    a: string,
    b: ProviderType,
    c: (comments: Comment[]) => void
  ) => void;
}

const ResultCard = ({
  result,
  cardPosition,
  useSettingsStore = useSettingsStoreDI,
  onFetchComments = onFetchCommentsDI,
}: Props) => {
  const [
    settings,
    setValueAll,
    setKeyValue,
    isPersistent,
    error,
    isLoadingStore,
  ] = useSettingsStore();

  const [shouldShowComments, setShouldShowComments] = useState(
    cardPosition < 1
  );

  const isDebugMode = settings[KEY_IS_DEBUG_MODE];
  const shouldUseOldRedditLink = settings[KEY_SHOULD_USE_OLD_REDDIT_LINK];
  const boldInitialCharsOfWords = settings[KEY_BOLD_INITIAL_CHARS_OF_WORDS];
  const fontSizes = settings[KEY_FONT_SIZES];
  const isIncognitoMode = settings[KEY_INCOGNITO_MODE];

  const resultWithReplacedLink = replaceRedditLinksInResult(
    result,
    shouldUseOldRedditLink
  );

  const onCardClick = (url: string) => {
    window.open(url, "_blank");
  };

  const createOnClickLogForumEvent = (eventType: EventType) => {
    return (e: React.MouseEvent<HTMLAnchorElement>) => {
      logForumResultEvent(
        eventType,
        cardPosition,
        resultWithReplacedLink,
        isIncognitoMode
      );
      e.stopPropagation();
    };
  };

  const isFiltered =
    result.relevanceScore !== undefined
      ? result.relevanceScore < ML_FILTER_THRESHOLD
      : false;

  // Open comments bar beneath this result
  const toggleComments = () => {
    // Toggle show state
    setShouldShowComments((prev: boolean) => !prev);
  };

  return (
    <div className="flex flex-col space-y-2 p-3">
      {isDebugMode && result.relevanceScore !== undefined && (
        <div className="text-base font-bold">
          Score: {result.relevanceScore.toFixed(1)}{" "}
          {isFiltered ? "(Filtered)" : ""}
        </div>
      )}
      {resultWithReplacedLink.providerQueryType ===
        ProviderQueryType.EXACT_URL && (
        // data-iscapture="true" allow us to immediately dismiss tooltip on user scroll
        <div
          data-tip="This result contains an exact link to your current page."
          data-iscapture="true"
        >
          <Badge>EXACT MATCH</Badge>
        </div>
      )}
      {resultWithReplacedLink.providerQueryType ===
        ProviderQueryType.EXACT_URL_TEXT && (
        // data-iscapture="true" allow us to immediately dismiss tooltip on user scroll
        <div
          data-tip="This result mentions your current page's link (or an expanded form of it) in the discussions."
          data-iscapture="true"
        >
          <Badge>DISCUSSION CONTAINS LINK</Badge>
        </div>
      )}

      {resultWithReplacedLink.subSourceName !== "" && (
        <div className="flex flex-row space-x-1">
          <div
            className={`${fontSizes.subText} font-medium text-indigo-500 hover:underline`}
          >
            <a
              href={resultWithReplacedLink.subSourceLink}
              target="_blank"
              onClick={createOnClickLogForumEvent(
                EventType.CLICK_SIDEBAR_FORUM_RESULT_SUB_SOURCE
              )}
            >
              {resultWithReplacedLink.subSourceName}
            </a>
          </div>
        </div>
      )}
      <div
        className={classNames(
          fontSizes.mainText,
          isFiltered
            ? "text-zinc-600 dark:text-zinc-500"
            : "text-black dark:text-zinc-300",
          "cursor-pointer font-normal space-x-2 hover:underline"
        )}
        onClick={() => {
          logForumResultEvent(
            EventType.CLICK_SIDEBAR_FORUM_RESULT_TITLE,
            cardPosition,
            resultWithReplacedLink,
            isIncognitoMode
          );
          onCardClick(resultWithReplacedLink.commentsLink);
        }}
      >
        <img
          alt="Source Icon"
          className="inline h-4 w-4"
          src={getImageUrl(resultWithReplacedLink.providerIconUrl)}
        />
        <a
          href={resultWithReplacedLink.commentsLink}
          target="_blank"
          rel="noreferrer"
          className="align-middle"
          onClick={createOnClickLogForumEvent(
            EventType.CLICK_SIDEBAR_FORUM_RESULT_TITLE
          )}
        >
          {boldInitialCharsOfWords
            ? boldFrontPortionOfWords(resultWithReplacedLink.submittedTitle)
            : resultWithReplacedLink.submittedTitle}
        </a>
      </div>

      <div
        className="rounded hover:outline outline-2 outline-slate-200 dark:outline-slate-600 outline-offset-4 cursor-pointer"
        onClick={(e: React.MouseEvent<HTMLElement>) => {
          toggleComments();
          logForumResultEvent(
            EventType.CLICK_SIDEBAR_FORUM_RESULT_SHOW_COMMENTS,
            cardPosition,
            resultWithReplacedLink,
            isIncognitoMode
          );
          e.stopPropagation();
        }}
      >
        <CardBottomBar
          commentsCount={resultWithReplacedLink.commentsCount}
          submittedUpvotes={resultWithReplacedLink.submittedUpvotes}
          submittedPrettyDate={resultWithReplacedLink.submittedPrettyDate}
          submittedByLink={resultWithReplacedLink.submittedByLink}
          submittedBy={resultWithReplacedLink.submittedBy}
          onClickSubmittedBy={createOnClickLogForumEvent(
            EventType.CLICK_SIDEBAR_FORUM_RESULT_AUTHOR
          )}
          useSettingsStore={useSettingsStore}
        />
        <ReactTooltip
          arrowColor="transparent"
          place="top"
          type="dark"
          effect="solid"
          delayShow={500}
        />
      </div>

      <ResultCardComments
        shouldShowComments={shouldShowComments}
        toggleShouldShowComments={toggleComments}
        commentsUrl={result.commentsLink}
        providerType={result.providerType}
        onFetchComments={onFetchComments}
        onClickSubmittedBy={createOnClickLogForumEvent(
          EventType.CLICK_SIDEBAR_FORUM_RESULT_AUTHOR
        )}
        useSettingsStore={useSettingsStore}
      />
    </div>
  );
};

export default ResultCard;
