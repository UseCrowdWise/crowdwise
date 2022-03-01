import React, { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { log } from "../utils/log";

interface hotkeyHistory {
  key: string;
  dateMillis: number;
}

const replaceHotkey = (key: string) => {
  // Mac's Command is represented as "Meta" and needs to be swapped.
  // See reference: https://github.com/jaywcjlove/hotkeys/blob/master/src/var.js
  switch (key) {
    case "Meta":
      return "⌘";
    case " ":
      return "Space";
    default:
      return key;
  }
};

const KEY_ORDER = [
  "⌥",
  "Alt",
  "Option",
  "⇧",
  "Shift",
  "⌃",
  "Ctrl",
  "Control",
  "⌘",
  "Cmd",
  "Command",
];

export const useHotkeysPressed = <T extends Element>(
  delayThreshold: number = 200,
  onKeyPressed?: (keys: string[]) => void,
  enabled: boolean = true
) => {
  const [hotkeysHistory, setHotkeysHistory] = useState<hotkeyHistory[]>([]);

  const appendHotkeysHistory = (key: string, dateMillis: number) => {
    setHotkeysHistory((_hotkeysHistory) => {
      const newestHotkeyHistory: hotkeyHistory = {
        key: key,
        dateMillis: dateMillis,
      };

      // Remove duplicate key
      // Remove previous keys if too long ago
      const filteredHotkeysHistory = _hotkeysHistory.filter(
        ({ key: oldKey, dateMillis: oldDateMillis }) =>
          oldKey !== key && dateMillis - oldDateMillis < delayThreshold
      );
      const sortedHotkeysHistory = [
        ...filteredHotkeysHistory,
        newestHotkeyHistory,
      ].sort((a, b) => {
        return KEY_ORDER.indexOf(b.key) - KEY_ORDER.indexOf(a.key);
      });

      if (onKeyPressed) {
        onKeyPressed(sortedHotkeysHistory.map((h) => h.key));
      }
      return sortedHotkeysHistory;
    });
  };

  // Use "*" to detect all hotkeys pressed
  const ref = useHotkeys<T>(
    "*",
    (e, handler) => {
      e.preventDefault();
      appendHotkeysHistory(replaceHotkey(e.key), Date.now());
    },
    { enabled }
  );

  return {
    ref,
    hotkeysHistory,
  };
};
