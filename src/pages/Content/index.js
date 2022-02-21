import { printLine } from "./modules/print";
import ReactDOM from "react-dom";
import { APP_NAME_SHORT } from "../../shared/constants";
import cx from "classnames";
import React, { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
// import './helpers/SidebarHelper';

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
  const [shouldShowSideBar, setShouldShowSideBar] = useState(true);

  // Close the side bar based on incoming message from further down in the component (close arrow)
  const handleMessage = (request, sender, sendResponse) => {
    console.log(
      sender.tab
        ? "from a content script:" + sender.tab.url
        : "from the extension"
    );
    if (request.closeSideBar === true) {
      setShouldShowSideBar((show) => !show);
    }
  };

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
          width: shouldShowSideBar ? "auto" : "0",
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
            bottom: "10px",
            right: "10px",
            borderRadius: "100%",
            width: "100px",
            height: "100px",
            backgroundColor: "red",
          }}
          onClick={() => setShouldShowSideBar((show) => !show)}
        />
      )}
    </div>
  );
};

ReactDOM.render(<App />, sidebarRoot);
