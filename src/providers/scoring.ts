import { ML_API_KEY, ML_FILTER_THRESHOLD, ML_HOST } from "../shared/constants";
import { log } from "../utils/log";
import { SingleProviderResults } from "./providers";

export const filterDocuments = async (
  documents: string[][]
): Promise<boolean[]> => {
  const headers = {
    "X-API-KEY": ML_API_KEY,
    "Content-Type": "application/json",
    accept: "application/json",
  };
  const response = await fetch(ML_HOST, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(documents),
  });
  const scores: number[] = await response.json();
  return scores.map((score) => score > ML_FILTER_THRESHOLD);
};

export const filterIrrelevantResults = async (
  query: string,
  resultsPromise: Promise<SingleProviderResults>
): Promise<SingleProviderResults> => {
  const singleProviderResults = await resultsPromise;
  if (singleProviderResults.results.length === 0) {
    return singleProviderResults;
  }

  try {
    const queryDocumentPairs = singleProviderResults.results.map((result) =>
      Array(query, result.submittedTitle)
    );
    const areDocumentsRelevant = await filterDocuments(queryDocumentPairs);
    const newProviderResults = {
      providerName: singleProviderResults.providerName,
      queryType: singleProviderResults.queryType,
      results: singleProviderResults.results.filter(
        (res, i) => areDocumentsRelevant[i]
      ),
    };
    log.debug("Filtering provider results, before vs after:");
    log.debug(singleProviderResults.results);
    log.debug(newProviderResults.results);
    return newProviderResults;
  } catch (e) {
    log.error(
      `Error while filtering results, returning original. Message: ${e}`
    );
    return singleProviderResults;
  }
};
