import { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";

import { Comment, ProviderType } from "../providers/providers";
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
  onFetchComments: (
    commentsUrl,
    providerType,
    commentsCallback: (comments: Comment[]) => void
  ) => {
    const comments: Comment[] = [
      {
        text: "hello world",
        author: "cool",
        createdDate: "123",
        children: [],
      },
    ];
    commentsCallback(comments);
  },
  fontSizes: { subText: "text-xs" },
};
