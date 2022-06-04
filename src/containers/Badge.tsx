import React from "react";

import { classNames } from "../utils/classNames";

export interface Props {
  className?: string;
  children: string;
}

const Badge = (props: Props) => {
  const { className, children } = props;
  return (
    <span
      className={classNames(
        "items-center px-2 py-0.5 -ml-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-zinc-300",
        className || ""
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
