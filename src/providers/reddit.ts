// Some code used from https://github.com/benwinding/newsit/
import { ResultItem } from "./providers";
import { cachedApiCall } from "../utils/cache";
import { log } from "../utils/log";
import { replaceTimeStr } from "../utils/time";
import { CACHE_URL_DURATION_SEC } from "../shared/constants";

const cheerio = require("cheerio");

// Main function to get all relevant results from Reddit
export async function getResults(cleanedUrl: string): Promise<ResultItem[]> {
  // const searchUrl = await getTabUrl(tabId);
  // const blocked = await alist.IsUrlBlackListed(searchUrl);
  // if (blocked) {
  //   logger.log("Reddit API: Url blocked");
  //   return {
  //     text: "-",
  //   };
  // }
  const queryString = "sort=top&q=" + encodeURIComponent("url:" + cleanedUrl);
  const requestUrl = "https://old.reddit.com/search?" + queryString;
  const data = await cachedApiCall(requestUrl, false, CACHE_URL_DURATION_SEC);

  const $ = cheerio.load(data);
  const itemsAll = $(".search-result")
    .map((i: number, el: Element) => translateRedditToItem($(el).html()))
    .toArray();

  if (itemsAll.length === 0) {
    log.debug("Reddit API: No urls matches found");
    return [];
  }

  return itemsAll;
}

function translateRedditToItem(html: string): ResultItem {
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

  const r: ResultItem = {
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
  return r;
}
