import { ResultItem } from "../providers/providers";
import ResultCard from "./ResultCard";
import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/outline";

interface Props {
  results: ResultItem[];
  numResults: number;
}

const ResultsContainer = (props: Props) => {
  const { results, numResults } = props;
  const [shouldShowMore, setShouldShowMore] = useState<boolean>(false);
  const filteredResults = shouldShowMore
    ? results
    : results.slice(0, numResults);
  const numberMoreToShow = results.length - filteredResults.length;
  return (
    <div className="space-y-2">
      {filteredResults.map((result, index) => (
        <ResultCard key={index} result={result} />
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
            <ChevronDownIcon className="h-4 w-4 text-slate-500" />
          </div>
        </div>
      )}
    </div>
  );
};

ResultsContainer.defaultProps = {
  numResults: 5,
};

export default ResultsContainer;