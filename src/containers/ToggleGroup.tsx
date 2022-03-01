import { Switch } from "@headlessui/react";
import React from "react";

import Toggle, { Props as ToggleProps } from "./Toggle";

interface Props extends ToggleProps {
  label?: string;
  description?: string;
}

export const ToggleGroup = (props: Props) => {
  const { label, description, checked, onCheck } = props;
  return (
    <Switch.Group as="div" className="flex items-center justify-between">
      <span className="flex flex-grow flex-col">
        {label && (
          <Switch.Label
            as="span"
            className="text-sm font-medium text-gray-900"
            passive
          >
            {label}
          </Switch.Label>
        )}
        {description && (
          <Switch.Description as="span" className="text-sm text-gray-500">
            {description}
          </Switch.Description>
        )}
      </span>
      <Toggle checked={checked} onCheck={onCheck} />
    </Switch.Group>
  );
};
