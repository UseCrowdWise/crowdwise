// Some code used from https://github.com/benwinding/newsit/
import { CACHE_URL_DURATION_SEC } from "../shared/constants";
import { cachedApiCall } from "../utils/cache";
import { log } from "../utils/log";
import { timeSince } from "../utils/time";
import { ResultItem } from "./providers";

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

// Main function to get all relevant results from HN
export async function getResults(cleanedUrl: string): Promise<ResultItem[]> {
  // const searchUrl = await getTabUrl(tabId);
  // const searchUrlStripped = stripUrl(searchUrl);
  // const blocked = await alist.IsUrlBlackListed(searchUrlStripped);
  // if (blocked) {
  //   logger.log("Hacker News API: Url blocked");
  //   return {
  //     text: "-",
  //   };
  // }
  const encodedUrl = encodeURIComponent(cleanedUrl);
  const queryString = `query=${encodedUrl}&restrictSearchableAttributes=url&typoTolerance=false`;
  const requestUrl = "https://hn.algolia.com/api/v1/search?" + queryString;
  const res: HnJsonResult = await cachedApiCall(
    requestUrl,
    true,
    CACHE_URL_DURATION_SEC
  );
  if (res.nbHits === 0) {
    log.debug("Hacker News API: No urls found");
    return [];
  }
  log.debug("HN Results Pre-translation:");
  log.debug(res.hits);
  const itemsAll = res.hits?.map(translateHnToItem) || [];
  // Checks that the right URL is submitted
  // const itemsResults = processResults(itemsAll, searchUrlStripped);
  log.debug("Hacker News returned results:", {
    response: res,
    resultsTranslated: itemsAll,
  });
  return itemsAll;
}

function translateHnToItem(h: HnHit): ResultItem {
  const fromNowStr = timeSince(h.created_at);
  // const fromNowFirst = fromNowStr.split(',').shift() + ' ago';
  return {
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
