import React from "react";

const isUpperCase = (text: string): boolean => text === text.toUpperCase();

export const boldFrontPortionOfWords = (text: string): JSX.Element => {
  return (
    <span>
      {text.split(" ").map((word) => {
        const boldedLen = isUpperCase(word)
          ? word.length
          : Math.ceil(word.length / 2);
        return (
          <span>
            <b>{word.substring(0, boldedLen)}</b>
            {word.substring(boldedLen)}{" "}
          </span>
        );
      })}
    </span>
  );
};
