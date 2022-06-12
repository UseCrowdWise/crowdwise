import { Comment, ProviderType } from "../providers/providers";

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
