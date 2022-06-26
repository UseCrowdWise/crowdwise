import { ChatIcon, ThumbUpIcon } from "@heroicons/react/solid";
import React from "react";

import { log } from "../utils/log";

interface Props {
  url: string;
  position: number;
  onDelete: (position: number) => void;
}

const BlacklistUrl = ({ url, position, onDelete }: Props) => {
  return (
    <>
      <div className="inline flex flex-row space-x-2 items-center">
        <a
          className="underline truncate text-blue-600 hover:text-blue-800"
          href={url}
        >
          {url}
        </a>
        <div className="grow" />
        <button
          className="inline-flex items-center rounded border border-gray-300 text-gray-700
                  px-2.5 py-1.5 text-xs font-medium shadow-sm hover:bg-indigo-600 hover:text-white"
          onClick={() => onDelete(position)}
        >
          Delete
        </button>
      </div>
    </>
  );
};

export default BlacklistUrl;
