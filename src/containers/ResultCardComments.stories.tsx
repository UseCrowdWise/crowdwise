import { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";

import { createMockOnFetchComments, mockComments } from "../tests/mocks";
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
  onFetchComments: createMockOnFetchComments(mockComments),
  fontSizes: { subText: "text-xs" },
};
