// Some code used from https://github.com/benwinding/newsit/
import { CACHE_URL_DURATION_SEC, PROVIDER_HN_NAME } from "../shared/constants";
import { cachedApiCall } from "../utils/cache";
import { log } from "../utils/log";
import { timeSince } from "../utils/time";
import {
  ProviderQueryType,
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

export class HnResultProvider implements ResultProvider {
  getProviderName() {
    return PROVIDER_HN_NAME;
  }

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
        providerName: this.getProviderName(),
        queryType: ProviderQueryType.EXACT_URL,
        results: [],
      };
    }
    log.debug("HN Results Pre-translation:");
    log.debug(res.hits);
    const itemsAll = res.hits?.map(translateHnToItem) || [];
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
      providerName: this.getProviderName(),
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
        providerName: this.getProviderName(),
        queryType: ProviderQueryType.EXACT_URL,
        results: [],
      };
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
    return {
      providerName: this.getProviderName(),
      queryType: ProviderQueryType.SITE_URL,
      results: itemsAll,
    };
  }

  // Main function to get all relevant results from HN
  async getTitleResults(title: string): Promise<SingleProviderResults> {
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
        providerName: this.getProviderName(),
        queryType: ProviderQueryType.TITLE,
        results: [],
      };
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
    return {
      providerName: this.getProviderName(),
      queryType: ProviderQueryType.TITLE,
      results: itemsAll,
    };
  }
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
