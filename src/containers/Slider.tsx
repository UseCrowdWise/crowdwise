import * as RadixSlider from "@radix-ui/react-slider";
import React from "react";

import { indexOfObjectArr } from "../utils/array";
import { classNames } from "../utils/classNames";

interface SliderProps extends RadixSlider.SliderProps {
  className?: string;
  choices?: Array<any>;
  defaultValue?: Array<any>;
  onValueChange?(value: any): void;
}

const Slider = (props: SliderProps) => {
  const { min, max, step, choices, defaultValue, onValueChange, className } =
    props;

  // When choices are provided, we should treat the slider as choosing from the choices
  const _onValueChange =
    choices && onValueChange
      ? (sizeIds: number[]) => onValueChange(choices[sizeIds[0]])
      : onValueChange;
  const _defaultValue =
    choices && defaultValue
      ? [indexOfObjectArr(choices, defaultValue[0])]
      : defaultValue;
  const _min = choices ? 0 : min;
  const _max = choices ? choices.length - 1 : max;
  const _step = choices ? 1 : step;

  return (
    <RadixSlider.Root
      min={_min}
      max={_max}
      step={_step}
      defaultValue={_defaultValue}
      onValueChange={_onValueChange}
      className={classNames(
        "relative flex h-4 select-none items-center",
        className ?? ""
      )}
    >
      <RadixSlider.Track className="flex-grow-1 relative h-1 w-full bg-neutral-200 dark:bg-gray-900">
        <RadixSlider.Range className="absolute h-full rounded-full bg-indigo-500" />
      </RadixSlider.Track>
      <RadixSlider.Thumb className="block h-5 w-5 rounded-full border border-neutral-300 bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
    </RadixSlider.Root>
  );
};

export default Slider;
