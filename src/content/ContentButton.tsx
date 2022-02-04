import React from "react";
import "./content.css";
import { ProviderResults } from "../providers/providers";

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
      className={`fixed bottom-0 right-0 z-[2000000000] rounded-lg text-lg mb-2 mr-2 ${
        hasResults ? "bg-green-400" : "bg-red-400"
      }`}
      onClick={props.onClicked}
    >
      {hasResults ? `Found ${numResults} discussions!` : "Find discussions!"}
    </button>
  );
}
