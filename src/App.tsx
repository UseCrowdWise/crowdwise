import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import ContentButton from "./content/ContentButton";
import { ProviderResultType } from "./providers/providers";
import SideBar from "./content/SideBar";

const mockProviderData = {
  resultType: ProviderResultType.Ok,
  hackerNews: [
    {
      submitted_url: "https://news.ycombinator.com/item?id=23005534",
      submitted_date: "",
      submitted_upvotes: 4,
      submitted_title:
        "Jina: The cloud-native neural search framework powered by AI and deep learning",
      submitted_by: "artex_xh",
      comments_count: 0,
      comments_link: "https://news.ycombinator.com/item?id=23005534",
    },
    {
      submitted_url: "https://news.ycombinator.com/item?id=23019044",
      submitted_date: "",
      submitted_upvotes: 2,
      submitted_title:
        "Show HN: Jina – open-source cloud-native neural search framework",
      submitted_by: "ReDeiPirati",
      comments_count: 0,
      comments_link: "https://news.ycombinator.com/item?id=23019044",
    },
    {
      submitted_url: "https://news.ycombinator.com/item?id=23383060",
      submitted_date: "",
      submitted_upvotes: 1,
      submitted_title:
        "Show HN: Jina Hello World, Build a Neural Search System in Minutes",
      submitted_by: "artex_xh",
      comments_count: 0,
      comments_link: "https://news.ycombinator.com/item?id=23383060",
    },
  ],
  reddit: [
    {
      submitted_url:
        "https://old.reddit.com/r/selfhosted/comments/mkaby9/opensource_project_to_build_your_own_ai_powered/",
      submitted_date: "",
      submitted_upvotes: 403,
      submitted_title:
        "Open-Source project to build your own AI powered search with just 7 lines of code. Supports semantic, text, image, audio & video search",
      submitted_by: "opensourcecolumbus",
      comments_count: 38,
      comments_link:
        "https://old.reddit.com/r/selfhosted/comments/mkaby9/opensource_project_to_build_your_own_ai_powered/",
    },
    {
      submitted_url:
        "https://old.reddit.com/r/degoogle/comments/o0hhj5/build_your_own_google_search_engine_using/",
      submitted_date: "",
      submitted_upvotes: 24,
      submitted_title:
        "Framework to build your own AI powered search with just 7 lines of code. Supports semantic, text, image, audio & video search",
      submitted_by: "opensourcecolumbus",
      comments_count: 3,
      comments_link:
        "https://old.reddit.com/r/programming/comments/mrtpam/framework_to_build_your_own_ai_powered_search/",
    },
    {
      submitted_url:
        "https://old.reddit.com/r/selfhosted/comments/mkaby9/opensource_project_to_build_your_own_ai_powered/",
      submitted_date: "",
      submitted_upvotes: 403,
      submitted_title:
        "Open-Source project to build your own AI powered search with just 7 lines of code. Supports semantic, text, image, audio & video search",
      submitted_by: "opensourcecolumbus",
      comments_count: 38,
      comments_link:
        "https://old.reddit.com/r/selfhosted/comments/mkaby9/opensource_project_to_build_your_own_ai_powered/",
    },
    {
      submitted_url:
        "https://old.reddit.com/r/degoogle/comments/o0hhj5/build_your_own_google_search_engine_using/",
      submitted_date: "",
      submitted_upvotes: 24,
      submitted_title:
        "Framework to build your own AI powered search with just 7 lines of code. Supports semantic, text, image, audio & video search",
      submitted_by: "opensourcecolumbus",
      comments_count: 3,
      comments_link:
        "https://old.reddit.com/r/programming/comments/mrtpam/framework_to_build_your_own_ai_powered_search/",
    },
  ],
};

function App() {
  const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(false);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      {isSideBarOpen ? (
        <SideBar
          onClose={() => setIsSideBarOpen(false)}
          providerData={mockProviderData}
        />
      ) : (
        <ContentButton
          onClicked={() => setIsSideBarOpen(true)}
          providerData={mockProviderData}
        />
      )}
    </div>
  );
}

export default App;
