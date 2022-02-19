import React, { useState } from "react";
import "./content.css";
import { useHotkeys } from "react-hotkeys-hook";
import { ProviderResults } from "../providers/providers";
import { AcademicCapIcon } from "@heroicons/react/solid";
import SideBar from "./SideBar";

interface Props {
  onClicked: () => void;
  providerData: ProviderResults;
}

export const ContentButton = (props: Props) => {
  const { providerData, onClicked } = props;
  const numResults =
    providerData.hackerNews.length + providerData.reddit.length;
  const hasResults = numResults > 0;

  return (
    <div className="fixed bottom-0 right-0 z-[2000000000]">
      <button
        data-tooltip-target="tooltip"
        className="rounded-full text-lg w-12 h-12 mr-6 mb-5 bg-blue-700 text-white hover:text-gray-400 focus:outline-none focus:text-gray-500 transition duration-150 ease-in-out"
        onClick={onClicked}
      >
        <div className="relative">
          <AcademicCapIcon className="w-8 h-8 stroke-0 mx-auto" />
          {hasResults && (
            <span className="absolute -right-2 -top-4">
              <div className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-semibold bg-red-600 text-white">
                {numResults}
              </div>
            </span>
          )}
        </div>
      </button>
      {/*<div*/}
      {/*  id="tooltip"*/}
      {/*  role="tooltip"*/}
      {/*  className="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip dark:bg-gray-700"*/}
      {/*>*/}
      {/*  Cmd + J*/}
      {/*  <div className="tooltip-arrow" data-popper-arrow />*/}
      {/*</div>*/}
    </div>
  );
};

export const ContentButtonWithSideBar = (props: Props) => {
  const { providerData, onClicked } = props;
  const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(false);

  const toggleSideBar = () => {
    setIsSideBarOpen((open) => !open);
    onClicked();
  };
  const closeSidebar = () => setIsSideBarOpen(false);

  // Trigger button on certain hotkeys
  useHotkeys("cmd+j", toggleSideBar);
  useHotkeys("esc", closeSidebar);

  return (
    <div>
      {isSideBarOpen ? (
        <SideBar onClose={closeSidebar} providerData={providerData} />
      ) : (
        <ContentButton onClicked={toggleSideBar} providerData={providerData} />
      )}
    </div>
  );
};
