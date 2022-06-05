import { ChevronDownIcon } from "@heroicons/react/outline";
import React, { useState } from "react";

import { ResultItem } from "../providers/providers";
import { KEY_IS_DEBUG_MODE, ML_FILTER_THRESHOLD } from "../shared/constants";
import { useSettingsStore } from "../shared/settings";
import ResultCard from "./ResultCard";

interface Props {
  results: ResultItem[];
  numResults: number;
}

const ResultsContainer = (props: Props) => {
  const { results, numResults } = props;
  const [shouldShowMore, setShouldShowMore] = useState<boolean>(false);
  const [
    settings,
    setSettings,
    setKeyValue,
    isPersistent,
    error,
    isLoadingStore,
  ] = useSettingsStore();
  const isDebugMode = settings[KEY_IS_DEBUG_MODE];

  // In debug mode, we want to see all results
  const filteredResults = isDebugMode
    ? results.filter((result) =>
        result.relevanceScore
          ? result.relevanceScore > ML_FILTER_THRESHOLD
          : true
      )
    : results;

  const partialResults = shouldShowMore
    ? filteredResults
    : filteredResults.slice(0, numResults);
  const numberMoreToShow = filteredResults.length - partialResults.length;

  return (
    <div className="space-y-2">
      {partialResults.map((result, index) => (
        <ResultCard key={index} cardPosition={index} result={result} />
      ))}
      {numberMoreToShow > 0 && (
        <div className="flex justify-center">
          <div className="inline-flex items-center space-x-0.5">
            <button
              className="font-medium text-slate-500"
              onClick={() => setShouldShowMore(true)}
            >
              Show {numberMoreToShow} More{" "}
            </button>
            <ChevronDownIcon
              className="h-4 w-4 cursor-pointer text-slate-500"
              onClick={() => setShouldShowMore(true)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

ResultsContainer.defaultProps = {
  numResults: 8,
};

export default ResultsContainer;
