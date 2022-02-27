import React from "react";
import { useState } from "react";
import { Switch } from "@headlessui/react";
import { log } from "../utils/log";
import { classNames } from "../utils/classNames";

export interface Props {
  checked: boolean;
  onCheck: (checked: boolean) => void;
}

const Toggle = (props: Props) => {
  const { checked, onCheck } = props;
  const [enabled, setEnabled] = useState<boolean>(checked);

  log.debug("Toggle rerender", checked, enabled);

  return (
    <Switch
      checked={enabled}
      onChange={(check: boolean) => {
        setEnabled(check);
        onCheck(check);
      }}
      className={classNames(
        enabled ? "bg-indigo-600" : "bg-gray-200",
        "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
      )}
    >
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className={classNames(
          enabled ? "translate-x-4" : "translate-x-0",
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
        )}
      />
    </Switch>
  );
};

export default Toggle;
