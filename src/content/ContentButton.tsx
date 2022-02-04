import React from "react";
import "./content.css";
import { ProviderResults } from "../providers/providers";
import { AcademicCapIcon } from "@heroicons/react/solid";

interface Props {
  onClicked: () => void;
  providerData: ProviderResults;
}

export default function ContentButton(props: Props) {
  const { providerData } = props;
  const numResults =
    providerData.hackerNews.length + providerData.reddit.length;
  const hasResults = numResults > 0;
  return (
    <button
      className="fixed bottom-0 right-0 z-[2000000000] rounded-full text-lg w-12 h-12 mr-6 mb-5 bg-blue-700 text-white hover:text-gray-400 focus:outline-none focus:text-gray-500 transition duration-150 ease-in-out"
      onClick={props.onClicked}
    >
      <div className="relative">
        <AcademicCapIcon className="w-8 h-8 stroke-0 mx-auto" />
        {hasResults && (
          <span className="absolute -right-2 -top-4">
            <div className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-semibold bg-red-600 text-white">
              {numResults}
            </div>
          </span>
        )}
      </div>
    </button>
  );
}
