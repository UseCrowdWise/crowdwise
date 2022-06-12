import { ChevronDownIcon } from "@heroicons/react/outline";
import React, { useState } from "react";

import { Comment, ProviderType, ResultItem } from "../providers/providers";
import { useSettingsStore as useSettingsStoreDI } from "../shared/settings";
import { onFetchComments as onFetchCommentsDI } from "../utils/results";
import ResultCard from "./ResultCard";

interface Props {
  results: ResultItem[];
  numResults?: number;
  useSettingsStore?: () => any;
  onFetchComments?: (
    a: string,
    b: ProviderType,
    c: (comments: Comment[]) => void
  ) => void;
}

const ResultsContainer = ({
  results,
  numResults = 8,
  useSettingsStore = useSettingsStoreDI,
  onFetchComments = onFetchCommentsDI,
}: Props) => {
  const [shouldShowMore, setShouldShowMore] = useState<boolean>(false);

  const partialResults = shouldShowMore
    ? results
    : results.slice(0, numResults);
  const numberMoreToShow = results.length - partialResults.length;

  return (
    <div className="space-y-2">
      {partialResults.map((result, index) => (
        <ResultCard
          key={index}
          cardPosition={index}
          result={result}
          useSettingsStore={useSettingsStore}
          onFetchComments={onFetchComments}
        />
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

export default ResultsContainer;
