import { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";

import { ProviderType } from "../providers/providers";
import {
  createMockOnFetchComments,
  mockComments,
  mockUseSettingsStore,
} from "../tests/mocks";
import ResultCardComments from "./ResultCardComments";

export default {
  title: "ResultCard/ResultCardComments",
  component: ResultCardComments,
  argTypes: {
    backgroundColor: { control: "color" },
  },
} as ComponentMeta<typeof ResultCardComments>;

const Template: ComponentStory<typeof ResultCardComments> = (args) => (
  <ResultCardComments {...args} />
);

export const Primary = Template.bind({});
Primary.args = {
  shouldShowComments: true,
  toggleShouldShowComments: () => {},
  commentsUrl: "",
  providerType: ProviderType.REDDIT,
  onClickSubmittedBy: () => {},
  onFetchComments: createMockOnFetchComments(0, mockComments),
  useSettingsStore: mockUseSettingsStore,
};
