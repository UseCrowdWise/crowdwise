// Some code used from https://github.com/benwinding/newsit/
import { ResultItem } from "./providers";
import { callApi } from "../utils/api";

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
  const data = await callApi(requestUrl, false);
  const html = document.createElement("html");
  html.innerHTML = data;
  const results = html.querySelectorAll(".search-result-link");
  if (results.length === 0) {
    html.remove();
    console.log("Reddit API: No urls matches found");
    return [];
  }
  const itemsAll = Array.from(results).map(translateRedditToItem);
  // const itemsResults = processResults(itemsAll, searchUrl);
  console.log("Reddit API: parsing api", {
    response: data,
    html,
    resultsHtml: results,
    resultsTranslated: itemsAll,
  });
  html.remove();
  return itemsAll;
}

function translateRedditToItem(el: Element): ResultItem {
  const url = querySafe<HTMLAnchorElement>(el, ".search-link", "href");
  const commentsText = querySafe<HTMLAnchorElement>(
    el,
    ".search-comments",
    "text"
  );
  const commentsLink = querySafe<HTMLAnchorElement>(
    el,
    ".search-comments",
    "href"
  );
  const postTitle = querySafe<HTMLAnchorElement>(el, ".search-title", "text");
  const postDate = querySafe<HTMLAnchorElement>(
    el,
    ".search-time time",
    "innerText"
  );
  const postPointsText = querySafe<HTMLAnchorElement>(
    el,
    ".search-score",
    "innerText"
  );
  const postAuthor = querySafe<HTMLAnchorElement>(
    el,
    ".search-author a",
    "text"
  );
  const commentsCount = parseInt(
    commentsText?.replace(",", "")?.split(" ")?.shift() || "0"
  );
  const postPoints = parseInt(postPointsText.split(" ").shift() || "0");
  const r: ResultItem = {
    raw_html: el.innerHTML,
    submitted_url: url,
    submitted_title: postTitle,
    submitted_date: postDate,
    submitted_upvotes: postPoints,
    submitted_by: postAuthor,
    comments_count: commentsCount,
    comments_link: commentsLink,
  };
  return r;
}

function querySafe<T extends Element>(
  el: Element,
  search: string,
  attr: keyof T
): string {
  const res = el.querySelector(search) as T;
  const attrVal = res ? res[attr] : "";
  return attrVal + "";
}
