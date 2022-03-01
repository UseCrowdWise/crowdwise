import _ from "lodash";
import React, { useState } from "react";

import { useSettingsStore } from "../shared/settings";
import { useHotkeysPressed } from "../shared/useHotkeysPressed";
import { classNames } from "../utils/classNames";
import { log } from "../utils/log";

interface Props {
  settingsKey: string;
  minNumHotkeys: number;
  debounceTime: number;
}

const HotkeysListenerButton = (props: Props) => {
  const { settingsKey, minNumHotkeys, debounceTime } = props;
  const [
    settings,
    setValueAll,
    setKeyValue,
    isPersistent,
    error,
    isLoadingStore,
  ] = useSettingsStore();
  // "+" and "," are special delimiters used by react-hotkeys-hook
  // replaceAll here is to prettify the hotkeys before showing to user
  const currentHotkeyCombos: string[] = settings[settingsKey];
  const hotkeysUserDisplay = currentHotkeyCombos
    .join(", ")
    .replaceAll("+", " + ");

  const [isHotkeyFocused, setIsHotkeyFocused] = useState<boolean>(false);

  log.debug("Hotkey Button rerender", currentHotkeyCombos);

  const onKeyPressed = _.debounce((keys: string[]) => {
    // Note that this is a single combo only, we do not support multiple hotkey
    // combos (except when it is the default option)
    const newHotkeyCombo = [keys.join("+")];
    log.debug("Key pressed", newHotkeyCombo);

    if (keys.length >= minNumHotkeys) {
      setKeyValue(settingsKey, newHotkeyCombo);
      setIsHotkeyFocused(false);
    }
  }, debounceTime);

  const { ref } = useHotkeysPressed<HTMLButtonElement>(
    200,
    onKeyPressed,
    isHotkeyFocused
  );

  if (isLoadingStore) return null;
  return (
    <div className="relative text-center">
      {isHotkeyFocused && (
        <div className="absolute -top-4 right-0 whitespace-nowrap text-[10px] text-slate-500">
          Enter hotkey
        </div>
      )}
      <button
        ref={ref}
        className={classNames(
          "inline-flex items-center rounded border border-gray-300",
          "px-2.5 py-1.5 text-xs font-medium shadow-sm",
          isHotkeyFocused
            ? "border-none bg-indigo-600 text-white"
            : "bg-white text-gray-700"
        )}
        onClick={() => setIsHotkeyFocused((focus) => !focus)}
        onBlur={() => setIsHotkeyFocused(false)}
      >
        {hotkeysUserDisplay}
      </button>
    </div>
  );
};

HotkeysListenerButton.defaultProps = {
  minNumHotkeys: 2,
  debounceTime: 200,
};

export default HotkeysListenerButton;
