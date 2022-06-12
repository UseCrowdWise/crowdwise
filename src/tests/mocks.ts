import hackernewsIcon from "../assets/img/hackernews_icon.png";
import redditIcon from "../assets/img/reddit_icon.png";
import {
  Comment,
  ProviderQueryType,
  ProviderType,
  ResultItem,
} from "../providers/providers";
import { INITIAL_SETTING_VALUES } from "../shared/settings";

export const mockUseSettingsStore = () => [
  INITIAL_SETTING_VALUES,
  null,
  null,
  null,
  null,
  null,
];

export const mockRedditResultItem: ResultItem = {
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

export const mockHackerNewsResultItem: ResultItem = {
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

export const mockComments: Comment[] = [
  {
    text: 'The advantage with firebase web sockets is that when they inevitably get blocked by firewalls you can always say "Would you mind whitelisting google? Thanks."',
    author: "rickdg",
    createdDate: "",
    commentLink: "",
    authorLink: "",
    points: 0,
    commentsCount: 0,
    createdPrettyDate: "",
    children: [],
  },
  {
    text: "Is that free or not? Cause I didn't see it anything.",
    author: "osmanyilmaz",
    createdDate: "",
    commentLink: "",
    authorLink: "",
    points: 0,
    commentsCount: 0,
    createdPrettyDate: "",
    children: [],
  },
  {
    text: "Besides the pricing, the other painful thing about Firebase are the storage rules. Given I understand you want to give maximum control to frontend developers without having a backend, the fact that I need to reimplement them if I switch serverless is an absolute pain. What are your plan regarding this aspect. Where are we going to implement the business logic?",
    author: "InvOfSmallC",
    createdDate: "",
    commentLink: "",
    authorLink: "",
    points: 0,
    commentsCount: 0,
    createdPrettyDate: "",
    children: [],
  },
];

export const mockResults: ResultItem[] = [
  {
    ...mockRedditResultItem,
    submittedTitle:
      "I'm trying to choose between Supabase and Postgres+Prisma for my Next.js project. Which one is better, how do you decide which one to pick?",
  },
  {
    ...mockHackerNewsResultItem,
    submittedTitle:
      "LPT: If you’re writing an essay and found one really great source but struggling to find others, check the cited sources from the one great source you have to see if any of them are useful for you before you try searching again on your own",
  },
  {
    ...mockRedditResultItem,
    submittedTitle:
      "Source Iconwhen using rtk query with supabase, when rendering on client side, it doesn't work properly with useEffect",
  },
  {
    ...mockRedditResultItem,
    submittedTitle:
      "Who has experience working with Prisma and Supabase Auth? Can you share some advice?",
  },
  {
    ...mockRedditResultItem,
    submittedTitle: "Nexjts and supabase blog",
  },
  {
    ...mockRedditResultItem,
    submittedTitle:
      "Get a modern frontend for your Supabase project in minutes, not days",
  },
  {
    ...mockRedditResultItem,
    submittedTitle: "Is there a way to user supabase auth with prisma?",
  },
  {
    ...mockRedditResultItem,
    submittedTitle: "How do I perform advanced validation with Supabase?",
  },
  {
    ...mockRedditResultItem,
    submittedTitle:
      "We open-sourced our dashboarding tool for Supabase users! Built using Vue 3 and Tailwind",
  },
  {
    ...mockRedditResultItem,
    submittedTitle:
      "I build a Free & Open Source API (using Supabase) to let you connect via REST API/Graphql for your next Portfolio Project! Introducing SupaDB!",
  },
];

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const createMockOnFetchComments = (
  time: number,
  mockComments: Comment[]
) => {
  return async (
    commentsUrl: string,
    providerType: ProviderType,
    commentsCallback: (comments: Comment[]) => void
  ) => {
    await sleep(time);
    commentsCallback(mockComments);
  };
};
