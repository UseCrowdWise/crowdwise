import {
  COLOR_HASH_FOR_STRINGS,
  COLOR_IF_OUTSIDE_HASH,
} from "../shared/constants";

export const hashStringToColor = (
  text: string,
  hash: Record<string, string> = COLOR_HASH_FOR_STRINGS,
  defaultValue: string = COLOR_IF_OUTSIDE_HASH
): string => {
  const firstLetter = text[0]?.toLowerCase();
  return hash[firstLetter] ?? defaultValue;
};
