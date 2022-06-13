import React, { useEffect, useState } from "react";
import { stripHtml } from "string-strip-html";

import { Comment, ProviderType } from "../providers/providers";
import {
  KEY_BOLD_INITIAL_CHARS_OF_WORDS,
  KEY_INCOGNITO_MODE,
  KEY_SHOULD_USE_OLD_REDDIT_LINK,
} from "../shared/constants";
import { EventType, logForumCommentEvent } from "../shared/events";
import { useSettingsStore as useSettingsStoreDI } from "../shared/settings";
import { boldFrontPortionOfWords } from "../utils/formatText";
import { log } from "../utils/log";
import { replaceRedditLinksInComment } from "../utils/results";
import CardBottomBar from "./CardBottomBar";

export interface Props {
  shouldShowComments: boolean;
  toggleShouldShowComments: () => void;
  commentsUrl: string;
  providerType: ProviderType;
  onClickSubmittedBy: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onFetchComments: (
    commentsUrl: string,
    providerType: ProviderType,
    callback: (comments: Comment[]) => void
  ) => void;
  useSettingsStore?: () => any;
}

const ResultCardComments = ({
  shouldShowComments,
  toggleShouldShowComments,
  commentsUrl,
  providerType,
  onClickSubmittedBy,
  onFetchComments,
  useSettingsStore = useSettingsStoreDI,
}: Props) => {
  const [
    settings,
    setValueAll,
    setKeyValue,
    isPersistent,
    error,
    isLoadingStore,
  ] = useSettingsStore();
  const boldInitialCharsOfWords = settings[KEY_BOLD_INITIAL_CHARS_OF_WORDS];
  const shouldUseOldRedditLink = settings[KEY_SHOULD_USE_OLD_REDDIT_LINK];
  const isIncognitoMode = settings[KEY_INCOGNITO_MODE];

  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [hasFetchedComments, setHasFetchedComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (shouldShowComments && !hasFetchedComments) {
      setHasFetchedComments(true);
      log.debug("Sending message to bg script for comments.");

      onFetchComments(commentsUrl, providerType, (newComments: Comment[]) => {
        log.debug("Comments:");
        log.debug(newComments);
        setComments(
          newComments.map((comment: Comment) =>
            replaceRedditLinksInComment(comment, shouldUseOldRedditLink)
          )
        );
        setIsLoadingComments(false);
      });
    }
  }, [shouldShowComments, commentsUrl, providerType]);

  if (!shouldShowComments) return null;

  if (isLoadingComments) {
    return (
      <div className="flex flex-col items-center justify-center pt-2">
        <div className="loader mb-2 h-6 w-6 rounded-full border-4 border-t-4 ease-linear" />
        <h2 className="text-center text-sm text-black dark:text-zinc-300">
          Loading comments...
        </h2>
      </div>
    );
  }

  if (comments.length <= 0) {
    return (
      <div className="flex flex-col space-y-2 items-center">
        <div className="text-black dark:text-zinc-300 text-sm space-x-2 text-semibold">
          No comments found.
        </div>
      </div>
    );
  }

  return (
    <div className="text-sm text-black dark:text-zinc-300">
      <div className="flex flex-row">
        <div
          // This is line that is demarcating the comments section
          className="flex border-r-2 hover:border-r-[3px] border-slate-200 dark:border-slate-600 hover:border-indigo-500 pl-2 mr-4 hover:mr-[15px] cursor-pointer"
          onClick={(e) => {
            toggleShouldShowComments();
            e.stopPropagation();
          }}
        />
        <div className="flex flex-col space-y-3">
          <div className="pt-2 text-indigo-600">Top Comments</div>
          {comments.map((comment: Comment, index) => {
            const commentContent = stripHtml(comment.text).result;

            const onClickCommentTitle = (
              e: React.MouseEvent<HTMLAnchorElement>
            ) => {
              logForumCommentEvent(
                EventType.CLICK_SIDEBAR_FORUM_COMMENT_TITLE,
                comment,
                isIncognitoMode
              );
              e.stopPropagation();
            };

            return (
              <div key={index} className="space-y-2 ">
                <div className="hover:underline">
                  <a
                    href={comment.commentLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={onClickCommentTitle}
                  >
                    {boldInitialCharsOfWords
                      ? boldFrontPortionOfWords(commentContent)
                      : commentContent}
                  </a>
                </div>
                <CardBottomBar
                  commentsCount={comment.commentsCount}
                  submittedUpvotes={comment.points}
                  submittedPrettyDate={comment.createdPrettyDate}
                  submittedByLink={comment.authorLink}
                  submittedBy={comment.author}
                  onClickSubmittedBy={onClickSubmittedBy}
                  useSettingsStore={useSettingsStore}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultCardComments;
