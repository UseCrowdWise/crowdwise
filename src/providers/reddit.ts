// Some code used from https://github.com/benwinding/newsit/
import { CACHE_URL_DURATION_SEC } from "../shared/constants";
import { cachedApiCall } from "../utils/cache";
import { log } from "../utils/log";
import { replaceTimeStr } from "../utils/time";
import {
  ProviderQueryType,
  ProviderType,
  ResultItem,
  ResultProvider,
  SingleProviderResults,
  Comment
} from "./providers";

const cheerio = require("cheerio");

export class RedditResultProvider implements ResultProvider {
  // Main function to get all relevant results from Reddit
  async getExactUrlResults(url: string): Promise<SingleProviderResults> {
    const queryString = "sort=top&q=" + encodeURIComponent("url:" + url);
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
  async getComments(url: string): Promise<Comment[]>{
    const data = await cachedApiCall(url + "/?sort=top", false, CACHE_URL_DURATION_SEC);
    const $ = cheerio.load(data);
    const commentsTable = $(".sitetable.nestedlisting")
    log.warn("Reddit comments table:")
    log.warn(commentsTable)
    return []
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
    const postDate = replaceTimeStr($(".search-time time").text());
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
      submittedDate: postDate,
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
