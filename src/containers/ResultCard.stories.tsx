import { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";

import hackernewsIcon from "../assets/img/hackernews_icon.png";
import redditIcon from "../assets/img/reddit_icon.png";
import {
  Comment,
  ProviderQueryType,
  ProviderType,
  ResultItem,
} from "../providers/providers";
import { INITIAL_SETTING_VALUES } from "../shared/settings";
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

const defaultRedditResult: ResultItem = {
  providerType: ProviderType.REDDIT,
  providerQueryType: ProviderQueryType.TITLE,
  cleanedTriggerUrl: "123",
  providerRequestUrl: "123",
  providerIconUrl: redditIcon,
  relevanceScore: 5,
  submittedUrl: "123",
  submittedDate: "123",
  submittedPrettyDate: "6 mo ago",
  submittedUpvotes: 10,
  submittedTitle:
    "I'm trying to choose between Supabase and Postgres+Prisma for my Next.js project. Which one is better, how do you decide which one to pick?",
  submittedBy: "lumenwrites",
  submittedByLink: "123",
  commentsCount: 20,
  commentsLink: "123",
  subSourceName: "r/Supabase",
  subSourceLink: "123",
};

const defaultHackerNewsResult: ResultItem = {
  providerType: ProviderType.HACKER_NEWS,
  providerQueryType: ProviderQueryType.TITLE,
  cleanedTriggerUrl: "123",
  providerRequestUrl: "123",
  providerIconUrl: hackernewsIcon,
  relevanceScore: 5,
  submittedUrl: "123",
  submittedDate: "123",
  submittedPrettyDate: "3 mo ago",
  submittedUpvotes: 10,
  submittedTitle:
    "LPT: If you’re writing an essay and found one really great source but struggling to find others, check the cited sources from the one great source you have to see if any of them are useful for you before you try searching again on your own",
  submittedBy: "paulg",
  submittedByLink: "123",
  commentsCount: 20,
  commentsLink: "123",
  subSourceName: "",
  subSourceLink: "",
};

const mockResults: ResultItem[] = [
  {
    ...defaultHackerNewsResult,
    submittedTitle:
      "I'm trying to choose between Supabase and Postgres+Prisma for my Next.js project. Which one is better, how do you decide which one to pick?",
  },
  {
    ...defaultHackerNewsResult,
    submittedTitle:
      "LPT: If you’re writing an essay and found one really great source but struggling to find others, check the cited sources from the one great source you have to see if any of them are useful for you before you try searching again on your own",
  },
];

const mockComments: Comment[] = [
  {
    text: 'The advantage with firebase web sockets is that when they inevitably get blocked by firewalls you can always say "Would you mind whitelisting google? Thanks."',
    author: "rickdg",
    createdDate: "",
    children: [],
  },
  {
    text: "Is that free or not? Cause I didn't see it anything.",
    author: "osmanyilmaz",
    createdDate: "",
    children: [],
  },
  {
    text: "Besides the pricing, the other painful thing about Firebase are the storage rules. Given I understand you want to give maximum control to frontend developers without having a backend, the fact that I need to reimplement them if I switch serverless is an absolute pain. What are your plan regarding this aspect. Where are we going to implement the business logic?",
    author: "InvOfSmallC",
    createdDate: "",
    children: [],
  },
];

const createMockOnFetchComments = (mockComments: Comment[]) => {
  return (
    commentsUrl: string,
    providerType: ProviderType,
    commentsCallback: (comments: Comment[]) => void
  ) => commentsCallback(mockComments);
};

const mockUseSettingsStore = () => [
  INITIAL_SETTING_VALUES,
  null,
  null,
  null,
  null,
  null,
];

export const Reddit = Template.bind({});
Reddit.args = {
  cardPosition: 0,
  result: defaultRedditResult,
  useSettingsStore: mockUseSettingsStore,
  onFetchComments: createMockOnFetchComments(mockComments),
};

export const HackerNews = Template.bind({});
HackerNews.args = {
  cardPosition: 0,
  result: defaultHackerNewsResult,
  useSettingsStore: mockUseSettingsStore,
  onFetchComments: createMockOnFetchComments(mockComments),
};
