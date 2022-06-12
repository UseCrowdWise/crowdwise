import { ChatIcon, ThumbUpIcon } from "@heroicons/react/solid";
import React from "react";

import {
  COLOR_IF_OUTSIDE_HASH,
  KEY_FONT_SIZES,
  KEY_SHOULD_COLOR_FOR_SUBMITTED_BY,
} from "../shared/constants";
import { useSettingsStore as useSettingsStoreDI } from "../shared/settings";
import { hashStringToColor } from "../utils/color";

interface Props {
  submittedPrettyDate: string;
  submittedByLink: string;
  submittedBy: string;
  commentsCount?: number;
  submittedUpvotes?: number;
  onClickSubmittedBy: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  useSettingsStore?: () => any;
}

const CardBottomBar = ({
  commentsCount,
  submittedUpvotes,
  submittedPrettyDate,
  submittedByLink,
  submittedBy,
  onClickSubmittedBy,
  useSettingsStore = useSettingsStoreDI,
}: Props) => {
  const [
    settings,
    setValueAll,
    setKeyValue,
    isPersistent,
    error,
    isLoadingStore,
  ] = useSettingsStore();
  const colorForSubmittedBy = settings[KEY_SHOULD_COLOR_FOR_SUBMITTED_BY]
    ? hashStringToColor(submittedBy)
    : COLOR_IF_OUTSIDE_HASH;
  const fontSizes = settings[KEY_FONT_SIZES];
  return (
    <div className={`${fontSizes.subText} flex flex-row flex-wrap space-x-3`}>
      {Number.isInteger(commentsCount) && (
        <div className="flex flex-row items-center space-x-1">
          <strong className="text-slate-500">{commentsCount}</strong>
          <ChatIcon className="h-3 w-3 text-slate-300" />
        </div>
      )}
      {Number.isInteger(submittedUpvotes) && (
        <div className="flex flex-row items-center space-x-1">
          <strong className="text-slate-500">{submittedUpvotes}</strong>
          <ThumbUpIcon className="h-3 w-3 text-slate-300" />
        </div>
      )}
      <div className="text-slate-600">{submittedPrettyDate}</div>
      <div className="grow" />
      <div className={`text-[11px] ${colorForSubmittedBy} hover:underline`}>
        <a href={submittedByLink} target="_blank" onClick={onClickSubmittedBy}>
          {submittedBy}
        </a>
      </div>
    </div>
  );
};

export default CardBottomBar;
