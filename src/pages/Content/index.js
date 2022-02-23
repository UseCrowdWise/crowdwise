import ReactDOM from "react-dom";
import React, { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  DEFAULT_SIDEBAR_OPACITY,
  DEFAULT_SIDEBAR_WIDTH,
  DEFAULT_HOTKEYS_CLOSE_SIDEBAR,
  DEFAULT_HOTKEYS_TOGGLE_SIDEBAR,
  KEY_HOTKEYS_TOGGLE_SIDEBAR,
  KEY_SIDEBAR_OPACITY,
  KEY_SIDEBAR_WIDTH,
} from "../../shared/constants";
import { log } from "../../utils/log";
import { useChromeStorage } from "../../shared/useChromeStorage";
import ReactTooltip from "react-tooltip";
import "./index.css";

log.debug("Content script works!");
log.debug("Must reload extension for modifications to take effect.");

let sidebarRoot = document.createElement("div");
sidebarRoot.classList.add("allUnset");
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sideBarWidth, setSideBarWidth] = useChromeStorage(
    KEY_SIDEBAR_WIDTH,
    DEFAULT_SIDEBAR_WIDTH
  );
  const [sideBarOpacity, setSideBarOpacity] = useChromeStorage(
    KEY_SIDEBAR_OPACITY,
    DEFAULT_SIDEBAR_OPACITY
  );
  const [hotkeysToggleSidebar, setHotkeysToggleSidebar] = useChromeStorage(
    KEY_HOTKEYS_TOGGLE_SIDEBAR,
    DEFAULT_HOTKEYS_TOGGLE_SIDEBAR,
    []
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

  // Toggle the sidebar activation button as necessary
  // i.e., don't show it on fullscreen
  const handleFullscreenChange = () => {
    if (document.fullscreen) {
      log.debug("Entering fullscreen and hiding button!");
      setIsFullscreen(true);
    } else {
      log.debug("Exiting fullscreen and showing button (if necessary)");
      setIsFullscreen(false);
    }
  };

  // Hotkeys to control the sidebar visibility.
  // Note: The SideBar also needs to implement the same hotkey shortcuts because it will be within an iFrame
  useHotkeys(hotkeysToggleSidebar.join(","), toggleSideBar);
  useHotkeys(DEFAULT_HOTKEYS_CLOSE_SIDEBAR.join(","), closeSideBar);

  useEffect(() => {
    // Add listeners when component mounts
    chrome.runtime.onMessage.addListener(handleMessage);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Remove listeners when this component unmounts
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
      document.removeEventListener("fullscreenchange");
    };
  }, []);

  // Don't display anything when it's full screen
  if (isFullscreen) return null;

  return shouldShowSideBar ? (
    <iframe
      title="sidebar-iframe"
      style={{
        width: shouldShowSideBar ? `${sideBarWidth}rem` : "0",
        height: "100vh",
        border: "none",
        borderSizing: "border-box",
        opacity: sideBarOpacity / 100,
      }}
      src={chrome.runtime.getURL("sidebar.html")}
      onLoad={() => log.debug("iFrame loaded")}
    />
  ) : (
    <div
      className="allUnset"
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
    >
      {/*Height and width needed because no text is given to p tag*/}
      <p
        data-tip={hotkeysToggleSidebar.join(", ").replaceAll("+", " + ")}
        className="resetSpacing"
        style={{
          height: "64px",
          width: "64px",
        }}
      />
      <ReactTooltip place="top" type="dark" effect="solid" />
    </div>
  );
};

ReactDOM.render(<App />, sidebarRoot);
