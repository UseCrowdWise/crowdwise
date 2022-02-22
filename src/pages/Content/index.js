import { printLine } from "./modules/print";
import ReactDOM from "react-dom";
import React, { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  HOTKEYS_CLOSE_SIDEBAR,
  HOTKEYS_TOGGLE_SIDEBAR,
  KEY_SIDEBAR_WIDTH,
} from "../../shared/constants";
import { log } from "../../utils/log";
import { useChromeStorage } from "../../shared/useChromeStorage";

console.log("Content script works!");
console.log("Must reload extension for modifications to take effect.");

printLine("Using the 'printLine' function from the Print Module");

let sidebarRoot = document.createElement("div");
sidebarRoot.style["height"] = "100vh";
sidebarRoot.style["top"] = 0;
sidebarRoot.style["right"] = 0;
sidebarRoot.style["position"] = "fixed";
sidebarRoot.style["zIndex"] = 999999999;

document.body.appendChild(sidebarRoot);
sidebarRoot.setAttribute("id", "vt-sidebar-root");

// First react component that is rendered onto vt-sidebar-root
// This had to be a class so we can mount and unmount chrome listeners
const App = () => {
  log.debug("App re-render");

  const [shouldShowSideBar, setShouldShowSideBar] = useState(true);
  const [sideBarWidth, setSideBarWidth] = useChromeStorage(
    KEY_SIDEBAR_WIDTH,
    24
  );

  const toggleSideBar = () => setShouldShowSideBar((show) => !show);
  const closeSideBar = () => setShouldShowSideBar(false);

  // Toggle the side bar based on incoming message from further down in the component (close arrow)
  const handleMessage = (request, sender, sendResponse) => {
    if (request.toggleSideBar === true) {
      toggleSideBar();
    } else if (request.closeSideBar === true) {
      closeSideBar();
    }
  };

  // Hotkeys to control the sidebar visibility.
  // Note: The SideBar also needs to implement the same hotkey shortcuts because it will be within an iFrame
  useHotkeys(HOTKEYS_TOGGLE_SIDEBAR, toggleSideBar);
  useHotkeys(HOTKEYS_CLOSE_SIDEBAR, closeSideBar);

  useEffect(() => {
    // Add listener when component mounts
    chrome.runtime.onMessage.addListener(handleMessage);

    // Remove listener when this component unmounts
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  return (
    <div>
      <iframe
        title="sidebar-iframe"
        style={{
          width: shouldShowSideBar ? `${sideBarWidth}rem` : "0",
          height: "100vh",
          border: "none",
          borderSizing: "border-box",
          opacity: 0.95,
        }}
        src={chrome.runtime.getURL("sidebar.html")}
        // ref={(frame) => (this.frame = frame)}
        onLoad={() => console.log("iFrame loaded")}
      />
      {!shouldShowSideBar && (
        <div
          style={{
            position: "fixed",
            bottom: "16px",
            right: "16px",
            borderRadius: "100%",
            width: "64px",
            height: "64px",
            backgroundColor: "blue",
          }}
          onClick={toggleSideBar}
        />
      )}
    </div>
  );
};

ReactDOM.render(<App />, sidebarRoot);
