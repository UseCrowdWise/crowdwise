import { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";

import {
  createMockOnFetchComments,
  mockComments,
  mockHackerNewsResultItem,
  mockRedditResultItem,
  mockUseSettingsStore,
} from "../tests/mocks";
import ResultCard from "./ResultCard";

export default {
  title: "ResultCard/ResultCard",
  component: ResultCard,
  argTypes: {
    backgroundColor: { control: "color" },
  },
} as ComponentMeta<typeof ResultCard>;

const Template: ComponentStory<typeof ResultCard> = (args) => (
  <ResultCard {...args} />
);

export const Reddit = Template.bind({});
Reddit.args = {
  cardPosition: 0,
  result: mockRedditResultItem,
  useSettingsStore: mockUseSettingsStore,
  onFetchComments: createMockOnFetchComments(0, mockComments),
};

export const HackerNews = Template.bind({});
HackerNews.args = {
  cardPosition: 0,
  result: mockHackerNewsResultItem,
  useSettingsStore: mockUseSettingsStore,
  onFetchComments: createMockOnFetchComments(0, mockComments),
};
