// Some code used from https://github.com/benwinding/newsit/
import { CACHE_URL_DURATION_SEC } from "../shared/constants";
import { cachedApiCall } from "../utils/cache";
import { log } from "../utils/log";
import { timeSince } from "../utils/time";
import {
  Comment,
  ProviderQueryType,
  ProviderType,
  ResultItem,
  ResultProvider,
  SingleProviderResults,
} from "./providers";

interface HnHit {
  url: string;
  created_at: string;
  author: string;
  title: string;
  num_comments: number;
  points: number;
  objectID: string;
}

interface HnJsonResult {
  nbHits: number;
  hits: HnHit[];
}

interface HnComment {
  author: string;
  text: string;
  created_at: string;
  children: HnComment[];
}

interface HnCommentsResults {
  children: HnComment[];
}

// NOTE: critical to prevent us from processing all possible comments
const MAX_COMMENTS = 3;
// 2 refers to a reply chain 2 replies long (main -> reply -> replyback)
const MAX_COMMENT_REPLIES = 2;

export class HnResultProvider implements ResultProvider {
  // Main function to get all relevant results from HN
  async getExactUrlResults(url: string): Promise<SingleProviderResults> {
    const encodedUrl = encodeURIComponent(url);
    const queryString = `query=${encodedUrl}&restrictSearchableAttributes=url&typoTolerance=false`;
    const requestUrl = "https://hn.algolia.com/api/v1/search?" + queryString;
    const res: HnJsonResult = await cachedApiCall(
      requestUrl,
      true,
      CACHE_URL_DURATION_SEC
    );
    if (res.nbHits === 0) {
      log.debug("Hacker News API: No urls found");
      return {
        providerName: ProviderType.HACKER_NEWS,
        queryType: ProviderQueryType.EXACT_URL,
        results: [],
      };
    }
    log.debug("HN Results Pre-translation:");
    log.debug(res.hits);
    const itemsAll =
      res.hits?.map((hnHit) =>
        translateHnToItem(hnHit, ProviderQueryType.EXACT_URL, url, requestUrl)
      ) || [];
    // <rest>..facebook.com and <rest>..facebook.com/ allowed, but
    // <rest>..utm_source=facebook.com not allowed
    const itemsDeduped = itemsAll.filter(
      (item) =>
        (item.submittedUrl.endsWith(url) ||
          item.submittedUrl.endsWith(url + "/")) &&
        !item.submittedUrl.endsWith("=" + url) &&
        !item.submittedUrl.endsWith("=" + url + "/")
    );
    // Checks that the right URL is submitted
    // const itemsResults = processResults(itemsAll, searchUrlStripped);
    log.debug("Hacker News returned results:", {
      response: res,
      resultsWithoutDedup: itemsAll,
      resultsTranslated: itemsDeduped,
    });
    return {
      providerName: ProviderType.HACKER_NEWS,
      queryType: ProviderQueryType.EXACT_URL,
      results: itemsDeduped,
    };
  }

  // Main function to get all relevant results from HN
  async getSiteUrlResults(url: string): Promise<SingleProviderResults> {
    const encodedUrl = encodeURIComponent(url);
    const queryString = `query=${encodedUrl}&restrictSearchableAttributes=url&typoTolerance=false`;
    const requestUrl = "https://hn.algolia.com/api/v1/search?" + queryString;
    const res: HnJsonResult = await cachedApiCall(
      requestUrl,
      true,
      CACHE_URL_DURATION_SEC
    );
    if (res.nbHits === 0) {
      log.debug("Hacker News API: No urls found");
      return {
        providerName: ProviderType.HACKER_NEWS,
        queryType: ProviderQueryType.EXACT_URL,
        results: [],
      };
    }
    log.debug("HN Results Pre-translation:");
    log.debug(res.hits);
    const itemsAll =
      res.hits?.map((hnHit) =>
        translateHnToItem(hnHit, ProviderQueryType.SITE_URL, url, requestUrl)
      ) || [];
    // Checks that the right URL is submitted
    // const itemsResults = processResults(itemsAll, searchUrlStripped);
    log.debug("Hacker News returned results:", {
      response: res,
      resultsTranslated: itemsAll,
    });
    return {
      providerName: ProviderType.HACKER_NEWS,
      queryType: ProviderQueryType.SITE_URL,
      results: itemsAll,
    };
  }

  // Main function to get all relevant results from HN
  async getTitleResults(
    url: string,
    title: string
  ): Promise<SingleProviderResults> {
    const encodedUrl = encodeURIComponent(title);
    const queryString = `query=${encodedUrl}&typoTolerance=false&tags=story`;
    const requestUrl = "https://hn.algolia.com/api/v1/search?" + queryString;
    const res: HnJsonResult = await cachedApiCall(
      requestUrl,
      true,
      CACHE_URL_DURATION_SEC
    );
    if (res.nbHits === 0) {
      log.debug("Hacker News API: No urls found");
      return {
        providerName: ProviderType.HACKER_NEWS,
        queryType: ProviderQueryType.TITLE,
        results: [],
      };
    }
    log.debug("HN Results Pre-translation:");
    log.debug(res.hits);
    const itemsAll =
      res.hits?.map((hnHit) =>
        translateHnToItem(hnHit, ProviderQueryType.TITLE, url, requestUrl)
      ) || [];
    // Checks that the right URL is submitted
    // const itemsResults = processResults(itemsAll, searchUrlStripped);
    log.debug("Hacker News returned results:", {
      response: res,
      resultsTranslated: itemsAll,
    });
    return {
      providerName: ProviderType.HACKER_NEWS,
      queryType: ProviderQueryType.TITLE,
      results: itemsAll,
    };
  }

  // Gets all comments for a HN post ("story") on request
  // Requires that the url is a comments link for a post (.commentsLink from a HN result)
  async getComments(url: string): Promise<Comment[]> {
    const storyId = new URL(url).searchParams.get("id");
    // If somehow this is an invalid URL, don't continue
    if (storyId === null) return [];
    // Otherwise, we make a call to the HN API
    const requestUrl = "https://hn.algolia.com/api/v1/items/" + storyId;
    const res = await cachedApiCall(requestUrl, true, CACHE_URL_DURATION_SEC);
    if (!res) return [];
    // NOTE: we assume all children here are of type 'comment'
    // Seems reasonable since all children of a 'story' should be comment, right?
    const hnComments: HnComment[] = res.children;
    // No comments
    if (hnComments === null || hnComments.length === 0) return [];

    const hnCommentToGenericCommentMapper = (
      hnComment: HnComment,
      depth: number
    ): Comment => {
      let children: Comment[] = [];
      // Only look for child comments if we haven't exceeded our recursion depth
      if (depth <= MAX_COMMENT_REPLIES) {
        const nextLevelComments = hnComment.children;
        nextLevelComments.length = Math.min(
          nextLevelComments.length,
          MAX_COMMENTS
        );
        children = nextLevelComments.map((hnComment) =>
          hnCommentToGenericCommentMapper(hnComment, depth + 1)
        );
      }
      return {
        author: hnComment.author || "",
        text: hnComment.text ? hnComment.text.slice(3, -4) : "", // We need to remove the <p> tag
        createdDate: hnComment.created_at,
        // Recursively map on the comment children
        children,
      };
    };

    hnComments.length = Math.min(hnComments.length, MAX_COMMENTS);
    const comments = hnComments.map((hnComment) =>
      hnCommentToGenericCommentMapper(hnComment, 1)
    );
    // log.warn("HN Comments")
    // log.warn(comments)

    return comments;
  }
}

function translateHnToItem(
  h: HnHit,
  providerQueryType: ProviderQueryType,
  cleanedTriggerUrl: string,
  providerRequestUrl: string
): ResultItem {
  const fromNowStr = timeSince(h.created_at);
  // const fromNowFirst = fromNowStr.split(',').shift() + ' ago';
  return {
    providerType: ProviderType.HACKER_NEWS,
    providerQueryType,
    cleanedTriggerUrl,
    providerRequestUrl,
    providerIconUrl: "hackernews_icon.png",
    submittedUrl: h.url,
    submittedDate: fromNowStr,
    submittedUpvotes: h.points,
    submittedTitle: h.title,
    submittedBy: h.author,
    submittedByLink: `https://news.ycombinator.com/user?id=${h.author}`,
    commentsCount: h.num_comments,
    commentsLink: `https://news.ycombinator.com/item?id=${h.objectID}`,
    subSourceName: "",
    subSourceLink: "",
  };
}
