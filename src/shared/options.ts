// Expressed in terms of tailwind classes
export const FONT_SIZE_OPTIONS = [
  { mainText: "text-xs", subText: "text-xs" },
  { mainText: "text-xs", subText: "text-sm" },
  { mainText: "text-xs", subText: "text-base" },
  { mainText: "text-sm", subText: "text-xs" },
  { mainText: "text-sm", subText: "text-sm" },
  { mainText: "text-sm", subText: "text-base" },
  { mainText: "text-base", subText: "text-xs" },
  { mainText: "text-base", subText: "text-sm" },
  { mainText: "text-base", subText: "text-base" },
  { mainText: "text-lg", subText: "text-xs" },
  { mainText: "text-lg", subText: "text-sm" },
  { mainText: "text-lg", subText: "text-base" },
];

export const CONTENT_BUTTON_PLACEMENT_OPTIONS = [
  { key: "top-left", value: "Top Left" },
  { key: "top-right", value: "Top Right" },
  { key: "bottom-left", value: "Bottom Left" },
  { key: "bottom-right", value: "Bottom Right" },
];

export type SortOption =
  | "highest-comments"
  | "lowest-comments"
  | "highest-likes"
  | "lowest-likes"
  | "newest"
  | "oldest";
export const RESULT_FEED_SORT_OPTIONS = [
  { key: "highest-comments", value: "Highest Comments" },
  { key: "lowest-comments", value: "Lowest Comments" },
  { key: "highest-likes", value: "Highest Likes" },
  { key: "lowest-likes", value: "Lowest Likes" },
  { key: "newest", value: "Newest" },
  { key: "oldest", value: "Oldest" },
];
