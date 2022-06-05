import { ML_API_KEY, ML_FILTER_THRESHOLD, ML_HOST } from "../shared/constants";
import { log } from "../utils/log";
import { SingleProviderResults } from "./providers";

export const scoreDocuments = async (
  documents: string[][]
): Promise<number[]> => {
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
  return await response.json();
};

export const scoreResultsRelevance = async (
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
    const documentScores = await scoreDocuments(queryDocumentPairs);
    const newProviderResults = {
      providerName: singleProviderResults.providerName,
      queryType: singleProviderResults.queryType,
      results: singleProviderResults.results.map((result, i) => {
        return {
          ...result,
          relevanceScore: documentScores[i],
        };
      }),
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
