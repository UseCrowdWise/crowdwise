import React, { useEffect, useState } from "react";

import { Comment, ProviderType } from "../providers/providers";
import { classNames } from "../utils/classNames";
import { log } from "../utils/log";

export interface Props {
  shouldShowComments: boolean;
  commentsUrl: string;
  providerType: ProviderType;
}

const ResultCardComments = (props: Props) => {
  const { shouldShowComments, commentsUrl, providerType } = props;
  const [hasFetchedComments, setHasFetchedComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (shouldShowComments && !hasFetchedComments) {
      setHasFetchedComments(true);
      log.debug("Sendimg message to bg script for comments.");
      chrome.runtime.sendMessage(
        { getComments: true, commentsUrl, providerType },
        (newComments: Comment[]) => {
          log.debug("Comments:");
          log.debug(newComments);
          setComments(newComments);
        }
      );
    }
  }, [shouldShowComments]);

  return (
    <div>
      {" "}
      {shouldShowComments && (
        <div className="space-y-2">
          {" "}
          <div className="flex flex-col space-y-2 bg-gray-100">
            <div className="text-black text-base space-x-2">Comments</div>
            {comments.map((comment: Comment, index) => (
              <div>
                <div>{comment.text}</div>

                <div>{comment.author}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCardComments;
