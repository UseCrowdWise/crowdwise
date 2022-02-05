import React from "react";
import { ResultItem } from "../providers/providers";

interface Props {
  result: ResultItem;
}

const ResultCard = (props: Props) => {
  const { result } = props;
  return (
    <div className="p-2 space-y-1 flex flex-col bg-white border border-slate-300 rounded">
      <div className="hover:underline text-sm text-blue-800">
        <a href={result.submitted_url}>{result.submitted_title}</a>
      </div>
      <div className="text-xs space-x-2 flex flex-row">
        <div>
          <strong>{result.submitted_upvotes}</strong> points
        </div>
        <div>
          <strong>{result.comments_count}</strong> comments
        </div>
        <div>{result.submitted_date}</div>
      </div>
    </div>
  );
};

export default ResultCard;
