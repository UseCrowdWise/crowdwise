import { Comment, ProviderType, ResultItem } from "../providers/providers";

export const onFetchComments = (
  commentsUrl: string,
  providerType: ProviderType,
  commentsCallback: (comments: Comment[]) => void
) => {
  chrome.runtime.sendMessage(
    {
      getComments: true,
      commentsUrl,
      providerType,
    },
    (newComments: Comment[]) => {
      commentsCallback(newComments);
    }
  );
};

export const replaceRedditLink = (
  url: string | undefined,
  shouldUseOldRedditLink: boolean
): string => {
  if (!url) return "";
  return shouldUseOldRedditLink
    ? url
    : url.replace("old.reddit.com", "reddit.com");
};

export const replaceRedditLinksInResult = (
  result: ResultItem,
  shouldUseOldRedditLink: boolean
): ResultItem => {
  return {
    ...result,
    submittedUrl: replaceRedditLink(
      result.submittedUrl,
      shouldUseOldRedditLink
    ),
    submittedByLink: replaceRedditLink(
      result.submittedByLink,
      shouldUseOldRedditLink
    ),
    commentsLink: replaceRedditLink(
      result.commentsLink,
      shouldUseOldRedditLink
    ),
    subSourceLink: replaceRedditLink(
      result.subSourceLink,
      shouldUseOldRedditLink
    ),
  };
};

export const replaceRedditLinksInComment = (
  comment: Comment,
  shouldUseOldRedditLink: boolean
): Comment => {
  return {
    ...comment,
    commentLink: replaceRedditLink(comment.commentLink, shouldUseOldRedditLink),
    authorLink: replaceRedditLink(comment.authorLink, shouldUseOldRedditLink),
  };
};
