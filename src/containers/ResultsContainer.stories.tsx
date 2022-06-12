import { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";

import {
  createMockOnFetchComments,
  mockComments,
  mockResults,
  mockUseSettingsStore,
} from "../tests/mocks";
import ResultsContainer from "./ResultsContainer";

export default {
  title: "ResultCard/ResultsContainer",
  component: ResultsContainer,
  argTypes: {
    backgroundColor: { control: "color" },
  },
} as ComponentMeta<typeof ResultsContainer>;

const Template: ComponentStory<typeof ResultsContainer> = (args) => (
  <ResultsContainer {...args} />
);

export const Primary = Template.bind({});
Primary.args = {
  results: mockResults,
  numResults: 10,
  useSettingsStore: mockUseSettingsStore,
  onFetchComments: createMockOnFetchComments(mockComments),
};
