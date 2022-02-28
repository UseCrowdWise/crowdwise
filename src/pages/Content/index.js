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
  KEY_HIDE_CONTENT_BUTTON,
  DEFAULT_HIDE_CONTENT_BUTTON,
  KEY_CONTENT_BUTTON_PLACEMENT,
  DEFAULT_CONTENT_BUTTON_PLACEMENT,
  DEFAULT_CONTENT_BUTTON_PLACEMENT_OFFSET,
  KEY_SIDEBAR_OPEN_TAB_STATE,
  DEFAULT_SIDEBAR_OPEN_TAB_STATE,
  KEY_CONTENT_BUTTON_BACKGROUND,
  DEFAULT_CONTENT_BUTTON_BACKGROUND,
  KEY_SHOULD_SHOW_SIDEBAR_ON_RESULTS,
} from "../../shared/constants";
import { log } from "../../utils/log";
import { useChromeStorage } from "../../shared/useChromeStorage";
import { useSettingsStore } from "../../shared/settings";
import ReactTooltip from "react-tooltip";
import DotLoader from "react-spinners/DotLoader";
import "./index.css";
import "animate.css";

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

  const [tabId, setTabId] = useState(undefined);

  const [isLoadingResults, setIsLoadingResults] = useState(null);
  const [numResults, setNumResults] = useState(null);
  const [userOpenedSideBar, setUserOpenedSideBar] = useState(
    DEFAULT_SIDEBAR_OPEN_TAB_STATE
  );
  const [
    userClosedSidebarSinceLatestResults,
    setUserClosedSidebarSinceLatestResults,
  ] = useState(false);

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
  const [hideContentButton, setHideContentButton] = useChromeStorage(
    KEY_HIDE_CONTENT_BUTTON,
    DEFAULT_HIDE_CONTENT_BUTTON
  );
  const [contentButtonBackground, setContentButtonBackground] =
    useChromeStorage(
      KEY_CONTENT_BUTTON_BACKGROUND,
      DEFAULT_CONTENT_BUTTON_BACKGROUND
    );
  const [contentButtonPlacement, setContentButtonPlacement] = useChromeStorage(
    KEY_CONTENT_BUTTON_PLACEMENT,
    DEFAULT_CONTENT_BUTTON_PLACEMENT
  );
  const [
    settings,
    setSettings,
    setKeyValue,
    isPersistent,
    error,
    isLoadingStore,
  ] = useSettingsStore();

  const showSidebarOnResults = settings[KEY_SHOULD_SHOW_SIDEBAR_ON_RESULTS];

  const toggleSideBar = () => toggleUserOpenedSidebarStateWithStorage();
  const closeSideBar = () => setUserOpenedSidebarStateWithStorage(false);

  // Toggle the side bar based on incoming message from further down in the component (close arrow)
  const handleMessage = (request, sender, sendResponse) => {
    if (request.toggleSideBar === true) {
      toggleSideBar();
    }
    if (request.closeSideBar === true) {
      closeSideBar();
    }
    if (request.newProviderDataCount !== undefined) {
      // We can differentiate between having 0 results but the call completes (maybe to un-animate a loading icon)
      //  and having > 0 results from the call
      setNumResults(request.newProviderDataCount);
      // If we just got a new set of results, we reset the user's preference to close the auto-opening sidebar.
      if (request.newProviderDataCount > 0) {
        setUserClosedSidebarSinceLatestResults(false);
      }
    }
    if (request.loadingProviderData !== undefined) {
      setIsLoadingResults(request.loadingProviderData);
    }
  };

  // Toggle the sidebar activation button as necessary
  // i.e., don't show it on fullscreen
  const handleFullscreenChange = () => {
    if (document.fullscreenElement) {
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

  // For listeners
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

  // For tab state from storage
  // "Expensive" computation of the sidebar state on first load
  // We get our tab ID from background script and then check local storage
  //  for this tab's sidebar open/closed state.
  // Then, we update the state with setUserOpenedSidebar
  useEffect(() => {
    log.debug("Sending message to background script to tell us our tab ID");
    chrome.runtime.sendMessage({ getTabId: true }, (tabId) => {
      setTabId(tabId);
      log.debug(`Background script tells us our tab ID should be ${tabId}`);
      const tabOpenClosedStateStorageKey = `${KEY_SIDEBAR_OPEN_TAB_STATE}${tabId}`;
      // Now we check local storage for tab state, otherwise return default val
      chrome.storage.local.get([tabOpenClosedStateStorageKey], (result) => {
        const shouldTabBeOpen =
          result[tabOpenClosedStateStorageKey] ??
          DEFAULT_SIDEBAR_OPEN_TAB_STATE;
        log.debug(`Sidebar should be open? ${shouldTabBeOpen}`);
        setUserOpenedSideBar(shouldTabBeOpen);
      });
    });
  }, []);

  // UI should call this to update sidebar state if it's a boolean
  // The storage will update too.
  const setUserOpenedSidebarStateWithStorage = (show) => {
    setUserOpenedSideBar(show);
    updateStorageWithOpenClosedState(show);
  };

  // UI should call this to update sidebar state if it needs to be toggled somehow
  // The storage will update too.
  const toggleUserOpenedSidebarStateWithStorage = () => {
    // For auto-sidebar - if the sidebar is currently open, that means it will be false after this toggle.
    // Therefore, count it as user closing sidebar if current status is open.
    if (userOpenedSideBar === true) {
      setUserClosedSidebarSinceLatestResults(true);
    }
    setUserOpenedSideBar((show) => {
      updateStorageWithOpenClosedState(!show);
      return !show;
    });
  };

  // Actually updates storage about the open-closed state
  // We once again ask the background script for our tab ID (storing this as state didn't work)
  // Then, we update storage with the key based on our tab ID
  const updateStorageWithOpenClosedState = (show) => {
    // For auto-sidebar
    if (show === false) {
      setUserClosedSidebarSinceLatestResults(true);
    }
    log.debug("Sending message to background script to tell us our tab ID");
    chrome.runtime.sendMessage({ getTabId: true }, (tabId) => {
      log.debug(`Background script tells us our tab ID should be ${tabId}`);
      const tabOpenClosedStateStorageKey = `${KEY_SIDEBAR_OPEN_TAB_STATE}${tabId}`;
      log.debug(
        `Setting open/closed state in storage for key ${tabOpenClosedStateStorageKey} to ${show}`
      );
      chrome.storage.local.set({ [tabOpenClosedStateStorageKey]: show }, () => {
        log.debug(
          `Set open/closed state in storage for key ${tabOpenClosedStateStorageKey} to ${show}`
        );
      });
    });
  };

  // NOTE: Do not do things such as this as it will force a re-render
  // if (isFullscreen) return null;

  // We should only auto-open the sidebar if the user hasn't interacted with the sidebar
  //  since the last set of provider results has come in (i.e., respect the button click)
  const shouldAutoOpenSideBar =
    showSidebarOnResults &&
    !isLoadingResults &&
    numResults > 0 &&
    !userClosedSidebarSinceLatestResults;
  const shouldShowSideBar =
    !isFullscreen && (userOpenedSideBar || shouldAutoOpenSideBar);
  const shouldShowContentButton =
    !isFullscreen && !shouldShowSideBar && !hideContentButton;

  const contentButtonTooltip =
    hotkeysToggleSidebar.join(", ").replaceAll("+", " + ") +
    "  (Go settings to hide button)";

  // Hide content button when we have not fetched its position. If we gave
  // a default placement (e.g. bottom-right), then there will be "flashing"
  // problems if the user has already specified a different placement
  // (e.g. top-left) where the button appears briefly at the bottom-right
  // and then goes to the top-left.
  const contentButtonPlacementCss =
    contentButtonPlacement === null
      ? { display: "none" }
      : {
          "top-left": {
            top: DEFAULT_CONTENT_BUTTON_PLACEMENT_OFFSET,
            left: DEFAULT_CONTENT_BUTTON_PLACEMENT_OFFSET,
          },
          "top-right": {
            top: DEFAULT_CONTENT_BUTTON_PLACEMENT_OFFSET,
            right: DEFAULT_CONTENT_BUTTON_PLACEMENT_OFFSET,
          },
          "bottom-left": {
            bottom: DEFAULT_CONTENT_BUTTON_PLACEMENT_OFFSET,
            left: DEFAULT_CONTENT_BUTTON_PLACEMENT_OFFSET,
          },
          "bottom-right": {
            bottom: DEFAULT_CONTENT_BUTTON_PLACEMENT_OFFSET,
            right: DEFAULT_CONTENT_BUTTON_PLACEMENT_OFFSET,
          },
        }[contentButtonPlacement.key];

  return (
    <div className="allUnset">
      {/*IMPORTANT: Reduce re-rendering of iframe because it will be laggy*/}
      <iframe
        title="sidebar-iframe"
        style={{
          width: shouldShowSideBar ? `${sideBarWidth}px` : "0",
          height: "100vh",
          border: "none",
          borderSizing: "border-box",
          opacity: sideBarOpacity / 100,
        }}
        src={chrome.runtime.getURL("sidebar.html")}
        onLoad={() => log.debug("iFrame loaded")}
      />
      {shouldShowContentButton && (
        <div
          className="allUnset"
          style={{
            ...contentButtonPlacementCss,
            position: "fixed",
          }}
          onClick={toggleSideBar}
        >
          {isLoadingResults && (
            <DotLoader
              color={"rgba(163,163,163,0.5)"}
              css={{
                display: "block",
                position: "absolute",
                right: "0",
              }}
              loading={isLoadingResults}
              size={20}
              margin={2}
            />
          )}
          {!isLoadingResults && numResults > 0 && (
            <div
              className="allUnset animate__animated animate__heartBeat"
              style={{
                position: "absolute",
                right: "0",
                textAlign: "center",
                fontSize: "12px",
                minWidth: "8px",
                backgroundColor: "red",
                color: "white",
                borderRadius: "16px",
                padding: "1px 5px",
              }}
            >
              {numResults}
            </div>
          )}
          {/*Height and width needed because no text is given to p tag*/}
          <img
            alt="Trigger Extension Button"
            style={{
              width: "64px",
              height: "64px",
            }}
            src={chrome.runtime.getURL(
              contentButtonBackground ? "icon.svg" : "icon-outline.svg"
            )}
            onClick={toggleSideBar}
          />
          <p
            data-tip={contentButtonTooltip}
            className="resetSpacing"
            style={{
              height: "64px",
              width: "64px",
              cursor: "pointer",
              top: "0",
              position: "absolute",
            }}
          />
          <ReactTooltip place="top" type="dark" effect="solid" />
        </div>
      )}
    </div>
  );
};

ReactDOM.render(<App />, sidebarRoot);
