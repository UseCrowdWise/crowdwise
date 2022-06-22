import "animate.css";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Draggable from "react-draggable";
import { useHotkeys } from "react-hotkeys-hook";
import DotLoader from "react-spinners/DotLoader";
import ReactTooltip from "react-tooltip";
import { zoomLevel } from "zoom-level";

import {
  DEFAULT_CONTENT_BUTTON_PLACEMENT_OFFSET,
  DEFAULT_HOTKEYS_CLOSE_SIDEBAR,
  DEFAULT_SIDEBAR_OPEN_TAB_STATE,
  KEY_CONTENT_BUTTON_BACKGROUND,
  KEY_CONTENT_BUTTON_PLACEMENT,
  KEY_CONTENT_BUTTON_PLACEMENT_TRANSLATION,
  KEY_HIDE_CONTENT_BUTTON,
  KEY_HOTKEYS_TOGGLE_SIDEBAR,
  KEY_SHOULD_SHOW_SIDEBAR_ONLY_ON_EXACT_RESULTS,
  KEY_SHOULD_SHOW_SIDEBAR_ON_RESULTS,
  KEY_SIDEBAR_OPACITY,
  KEY_SIDEBAR_OPEN_TAB_STATE,
  KEY_SIDEBAR_SQUEEZES_PAGE,
  KEY_SIDEBAR_WIDTH,
} from "../../shared/constants";
import { useSettingsStore } from "../../shared/settings";
import { log } from "../../utils/log";
import "./index.css";

log.debug("Content script works!");
log.debug("Must reload extension for modifications to take effect.");

let sidebarRoot = document.createElement("div");
sidebarRoot.classList.add("all-unset");
sidebarRoot.style["height"] = "100vh";
sidebarRoot.style["top"] = 0;
sidebarRoot.style["right"] = 0;
sidebarRoot.style["position"] = "fixed";
sidebarRoot.style["zIndex"] = 999999999;

const originalMarginRight = window.getComputedStyle(document.body).marginRight;

document.body.appendChild(sidebarRoot);
sidebarRoot.setAttribute("id", "vt-sidebar-root");

// First react component that is rendered onto vt-sidebar-root
// This had to be a class so we can mount and unmount chrome listeners
const App = () => {
  log.debug("App re-render");

  const [tabId, setTabId] = useState(undefined);

  const [isLoadingResults, setIsLoadingResults] = useState(null);
  const [numResults, setNumResults] = useState(null);
  const [numExactResults, setNumExactResults] = useState(null);
  const [userOpenedSideBar, setUserOpenedSideBar] = useState(
    DEFAULT_SIDEBAR_OPEN_TAB_STATE
  );
  const [
    userClosedSidebarSinceLatestResults,
    setUserClosedSidebarSinceLatestResults,
  ] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  const [
    settings,
    setSettings,
    setKeyValue,
    isPersistent,
    error,
    isLoadingStore,
  ] = useSettingsStore();

  // Don't load the button if we're still loading settings (need to know icon placement!)
  // if (isLoadingStore) return null;

  const sideBarWidth = settings[KEY_SIDEBAR_WIDTH];
  const sideBarOpacity = settings[KEY_SIDEBAR_OPACITY];
  const hotkeysToggleSidebar = settings[KEY_HOTKEYS_TOGGLE_SIDEBAR];
  const hideContentButton = settings[KEY_HIDE_CONTENT_BUTTON];
  const contentButtonBackground = settings[KEY_CONTENT_BUTTON_BACKGROUND];
  const contentButtonPlacement = settings[KEY_CONTENT_BUTTON_PLACEMENT];
  const buttonTranslation = settings[KEY_CONTENT_BUTTON_PLACEMENT_TRANSLATION];
  const sidebarSqueezePage = settings[KEY_SIDEBAR_SQUEEZES_PAGE];
  const showSidebarOnResults = settings[KEY_SHOULD_SHOW_SIDEBAR_ON_RESULTS];
  const showSidebarOnlyOnExactResults =
    settings[KEY_SHOULD_SHOW_SIDEBAR_ONLY_ON_EXACT_RESULTS];

  // These indicate whether we dragged or clicked
  const [lastPosX, setLastPosX] = useState(buttonTranslation.x);
  const [lastPosY, setLastPosY] = useState(buttonTranslation.y);
  // These directly control the position of the icon
  const [posX, setPosX] = useState(buttonTranslation.x);
  const [posY, setPosY] = useState(buttonTranslation.y);
  // Zoom level for scaling
  const [curZoom, setCurZoom] = useState(zoomLevel());

  // Update the button position if our settings change!
  useEffect(() => {
    const scaleFactor = curZoom / buttonTranslation.zoom;
    setLastPosX(buttonTranslation.x / scaleFactor);
    setLastPosY(buttonTranslation.y / scaleFactor);
    setPosX(buttonTranslation.x / scaleFactor);
    setPosY(buttonTranslation.y / scaleFactor);
  }, [settings[KEY_CONTENT_BUTTON_PLACEMENT_TRANSLATION]]);
  log.warn(
    `Current placement translation: ${buttonTranslation.x}, ${buttonTranslation.y}`
  );
  log.warn(`posX/posY: ${posX}, ${posY}, zoom: ${curZoom}`);

  const toggleSideBar = () => {
    if (!isDragging) {
      toggleUserOpenedSidebarStateWithStorage();
    }
  };
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
      setNumExactResults(request.newProviderExactDataCount);
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
    if (!chrome.runtime.onMessage.hasListener(handleMessage)) {
      chrome.runtime.onMessage.addListener(handleMessage);
    }
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
    (numExactResults > 0 || !showSidebarOnlyOnExactResults) &&
    !userClosedSidebarSinceLatestResults;
  const shouldShowSideBar =
    !isFullscreen && (userOpenedSideBar || shouldAutoOpenSideBar);
  const shouldShowContentButton =
    !isFullscreen && !shouldShowSideBar && !hideContentButton;

  const finalSideBarWidth = shouldShowSideBar ? `${sideBarWidth}px` : "0px";
  const contentButtonTooltip =
    hotkeysToggleSidebar.join(", ").replaceAll("+", " + ") +
    "  (Hide button in the settings)";

  if (sidebarSqueezePage) {
    document.body.style.marginRight = `calc(${originalMarginRight} + ${finalSideBarWidth})`;
  } else {
    document.body.style.marginRight = originalMarginRight;
  }

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

  // Initial position of the button before dragging
  const handleOnDragStart = (event, data) => {
    setLastPosX(data.x);
    setLastPosY(data.y);
  };

  const handleOnDragStop = (event, data) => {
    // event.stopPropagation();
    if (data.x === lastPosX && data.y === lastPosY) {
      // drag did not change anything. Consider this to be a click
      toggleSideBar();
    } else {
      // We dragged the sidebar to a new position, so update our settings
      setKeyValue(KEY_CONTENT_BUTTON_PLACEMENT_TRANSLATION, {
        x: data.x,
        y: data.y,
        zoom: curZoom,
      });
    }
    log.debug(`X/Y: ${data.x}, ${data.y}`);
    setPosX(data.x);
    setPosY(data.y);
  };

  return (
    <div className="all-unset">
      {/*IMPORTANT: Reduce re-rendering of iframe because it will be laggy*/}
      <iframe
        title="sidebar-iframe"
        style={{
          width: finalSideBarWidth,
          height: "100vh",
          border: "none",
          borderSizing: "border-box",
          opacity: sideBarOpacity / 100,
        }}
        src={chrome.runtime.getURL("sidebar.html")}
        onLoad={() => log.debug("iFrame loaded")}
      />
      {shouldShowContentButton && (
        <Draggable
          position={{ x: posX, y: posY }}
          onStart={handleOnDragStart}
          onStop={handleOnDragStop}
          /* scale={curZoom / buttonTranslation.zoom} */
        >
          <div
            className="all-unset"
            style={{
              ...contentButtonPlacementCss,
              position: "fixed",
            }}
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
                className={
                  "animate__animated animate__heartBeat badge " +
                  (numExactResults > 0 ? "badge-red" : "badge-grey")
                }
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
              className="reset-spacing"
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
        </Draggable>
      )}
    </div>
  );
};

ReactDOM.render(<App />, sidebarRoot);
