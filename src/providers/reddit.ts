// Some code used from https://github.com/benwinding/newsit/
import { parseISO } from "date-fns";

import { CACHE_URL_DURATION_SEC } from "../shared/constants";
import { cachedApiCall } from "../utils/cache";
import { log } from "../utils/log";
import { replaceTimeStr, timeSince } from "../utils/time";
import {
  Comment,
  ProviderQueryType,
  ProviderType,
  ResultItem,
  ResultProvider,
  SingleProviderResults,
} from "./providers";

// NOTE: critical to prevent us from processing all possible comments
const MAX_COMMENTS = 3;
// 2 refers to a reply chain 2 replies long (main -> reply -> replyback)
const MAX_COMMENT_REPLIES = 0;

const cheerio = require("cheerio");

export class RedditResultProvider implements ResultProvider {
  // Main function to get all relevant results from Reddit
  async getExactUrlResults(url: string): Promise<SingleProviderResults> {
    const queryString = "sort=top&q=" + encodeURIComponent('url:"' + url + '"');
    const requestUrl = "https://old.reddit.com/search?" + queryString;
    const data = await cachedApiCall(requestUrl, false, CACHE_URL_DURATION_SEC);

    const $ = cheerio.load(data);
    const itemsAll: ResultItem[] = $(".search-result.search-result-link")
      .map((i: number, el: Element) =>
        this.translateRedditToItem(
          $(el).html(),
          ProviderQueryType.EXACT_URL,
          url,
          requestUrl
        )
      )
      .toArray();
    // Remove non-exact url matches
    const itemsDeduped = itemsAll.filter(
      (item) =>
        (item.submittedUrl.endsWith(url) ||
          item.submittedUrl.endsWith(url + "/")) &&
        !item.submittedUrl.endsWith("=" + url) &&
        !item.submittedUrl.endsWith("=" + url + "/")
    );
    if (itemsDeduped.length === 0) {
      log.debug("Reddit API: No urls matches found");
      return {
        providerName: ProviderType.REDDIT,
        queryType: ProviderQueryType.EXACT_URL,
        results: [],
      };
    }

    return {
      providerName: ProviderType.REDDIT,
      queryType: ProviderQueryType.EXACT_URL,
      results: itemsDeduped,
    };
  }

  // Main function to get all relevant results from Reddit
  async getExactUrlTextResults(url: string): Promise<SingleProviderResults> {
    const queryString = 'sort=relevance&q="' + encodeURIComponent(url) + '"';
    const requestUrl = "https://old.reddit.com/search?" + queryString;
    const data = await cachedApiCall(requestUrl, false, CACHE_URL_DURATION_SEC);

    const $ = cheerio.load(data);
    const itemsAll: ResultItem[] = $(".search-result.search-result-link")
      .map((i: number, el: Element) =>
        this.translateRedditToItem(
          $(el).html(),
          ProviderQueryType.EXACT_URL_TEXT,
          url,
          requestUrl
        )
      )
      .toArray();

    if (itemsAll.length === 0) {
      return {
        providerName: ProviderType.REDDIT,
        queryType: ProviderQueryType.EXACT_URL_TEXT,
        results: [],
      };
    }

    return {
      providerName: ProviderType.REDDIT,
      queryType: ProviderQueryType.EXACT_URL_TEXT,
      results: itemsAll,
    };
  }

  async getSiteUrlResults(url: string): Promise<SingleProviderResults> {
    const queryString = "sort=top&q=" + encodeURIComponent("site:" + url);
    const requestUrl = "https://old.reddit.com/search?" + queryString;
    const data = await cachedApiCall(requestUrl, false, CACHE_URL_DURATION_SEC);

    const $ = cheerio.load(data);
    const itemsAll = $(".search-result.search-result-link")
      .map((i: number, el: Element) =>
        this.translateRedditToItem(
          $(el).html(),
          ProviderQueryType.SITE_URL,
          url,
          requestUrl
        )
      )
      .toArray();

    if (itemsAll.length === 0) {
      log.debug("Reddit API: No urls matches found");
      return {
        providerName: ProviderType.REDDIT,
        queryType: ProviderQueryType.SITE_URL,
        results: [],
      };
    }

    return {
      providerName: ProviderType.REDDIT,
      queryType: ProviderQueryType.SITE_URL,
      results: itemsAll,
    };
  }

  async getTitleResults(
    url: string,
    title: string
  ): Promise<SingleProviderResults> {
    const queryString =
      "q=" +
      title
        .split(" ")
        .map((word) => encodeURIComponent(word))
        .join("+");
    const requestUrl = "https://old.reddit.com/search?" + queryString;
    const data = await cachedApiCall(requestUrl, false, CACHE_URL_DURATION_SEC);

    const $ = cheerio.load(data);
    const itemsAll = $(".search-result.search-result-link")
      .map((i: number, el: Element) =>
        this.translateRedditToItem(
          $(el).html(),
          ProviderQueryType.TITLE,
          url,
          requestUrl
        )
      )
      .toArray();

    if (itemsAll.length === 0) {
      log.debug("Reddit API: No urls matches found");
      return {
        providerName: ProviderType.REDDIT,
        queryType: ProviderQueryType.TITLE,
        results: [],
      };
    }

    return {
      providerName: ProviderType.REDDIT,
      queryType: ProviderQueryType.TITLE,
      results: itemsAll,
    };
  }

  // Gets all comments for a reddit post
  // Requires that the url is a comments link for a post (.commentsLink from a result)
  async getComments(url: string): Promise<Comment[]> {
    const data = await cachedApiCall(
      url + "/?sort=top",
      false,
      CACHE_URL_DURATION_SEC
    );
    const $ = cheerio.load(data);
    const commentsTable = $(".sitetable.nestedlisting");
    // No comments or some other error
    if (!commentsTable || commentsTable.length === 0) {
      log.debug("No reddit comments for " + url);
      return [];
    }

    // Mapping function for each comment
    const redditCommentsToGenericCommentMapper = (
      redditComment: any,
      depth: number
    ): Comment => {
      const childComments = $(redditComment.children);
      const textHtml = childComments.find(".md")[0];
      const text = $(textHtml).contents().text();
      const author = childComments.find(".author")[0]?.children[0]?.data;
      const authorLink = childComments.find(".author")[0]?.attribs.href;
      const createdDate = childComments.find("time")[0]?.attribs.datetime;
      const createdPrettyDate = timeSince(parseISO(createdDate));
      const commentUpvotesText =
        childComments.find(".score.unvoted")[0]?.attribs?.title || "0";
      // parseInt can fail if the score is hidden, so return 0 if so
      const commentUpvotes = parseInt(commentUpvotesText) || 0;
      // This link only shows the comment and its children, and not the other comments
      const commentLink = childComments.find(".bylink")[0]?.attribs.href;

      let children = [];
      // Only look for child comments if we haven't exceeded our recursion depth
      if (depth <= MAX_COMMENT_REPLIES) {
        const nextLevelComments = childComments
          .siblings(".child")
          .children(".sitetable.listing")
          .children(".thing.comment");
        nextLevelComments.length = Math.min(
          nextLevelComments.length,
          MAX_COMMENTS
        );
        children = nextLevelComments
          .map((_: number, redditComment: any) =>
            redditCommentsToGenericCommentMapper(redditComment, depth + 1)
          )
          .get();
      }
      return {
        commentLink,
        authorLink,
        points: commentUpvotes,
        author,
        text,
        createdDate,
        createdPrettyDate,
        children,
      };
    };

    // Get root comments
    const rootComments = commentsTable.children(".thing.comment");
    // Hack to truncate the list
    rootComments.length = Math.min(rootComments.length, MAX_COMMENTS);
    const genericComments = rootComments
      .map((_: number, redditComment: any) =>
        redditCommentsToGenericCommentMapper(redditComment, 1)
      )
      .get();

    return genericComments;
  }

  translateRedditToItem(
    html: string,
    providerQueryType: ProviderQueryType,
    cleanedTriggerUrl: string,
    providerRequestUrl: string
  ): ResultItem {
    const $ = cheerio.load(html);
    const url = $(".search-link").attr("href");
    const commentsText = $(".search-comments").text();
    const commentsLink = $(".search-comments").attr("href");
    const postTitle = $(".search-title").text();
    const postDate = $(".search-time time").attr("datetime");
    const postPrettyDate = replaceTimeStr($(".search-time time").text());
    const postPointsText = $(".search-score").text();
    const postAuthor = $(".author").text();
    const postAuthorLink = $(".author").attr("href");
    const subreddit = $(".search-subreddit-link").text();
    const subredditLink = $(".search-subreddit-link").attr("href");

    const commentsCount = parseInt(
      commentsText?.replace(",", "")?.split(" ")?.shift() || "0"
    );
    const postPoints = parseInt(
      postPointsText?.replace(",", "")?.split(" ")?.shift() || "0"
    );

    return {
      providerType: ProviderType.REDDIT,
      providerQueryType,
      cleanedTriggerUrl,
      providerRequestUrl,
      providerIconUrl: "reddit_icon.png",
      rawHtml: html,
      submittedUrl: url,
      submittedTitle: postTitle,
      submittedDate: parseISO(postDate).toISOString(),
      submittedPrettyDate: postPrettyDate,
      submittedUpvotes: postPoints,
      submittedBy: postAuthor,
      submittedByLink: postAuthorLink,
      commentsCount: commentsCount,
      commentsLink: commentsLink,
      subSourceName: subreddit,
      subSourceLink: subredditLink,
    };
  }
}
