import React, { CSSProperties, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./content.css";

import { log } from "../utils/log";
/**
 * CONTENT SCRIPT.
 *
 * One instance of this script runs on each tab.
 * Calls the background script every time its URL changes.
 * Or re-calls the background script when it tells the content script that the URL has changed w/o a full page reload.
 *
 * Primarily responsible for displaying the results on the screen and handling user interaction.
 *  * */

function ContentScriptMain() {
  const [currentUrl, setCurrentUrl] = useState(window.location.href);

  // Runs everytime the current url changes
  useEffect(() => {
    // Starting useEffect call from content script
    log.debug("Starting call to providers");

    // Initiate the call to background script to get data from providers
    const getConversationData = async () => {
      const windowUrl = window.location.href;
      chrome.runtime.sendMessage({ windowUrl: windowUrl }, function (response) {
        log.debug("Printing provider data...");
        log.debug(response);
      });
    };
    // Actually run the async function
    getConversationData().catch(console.error);
  }, [currentUrl]);

  // Registers callback to handle new messages from chrome background script
  useEffect(() => {
    log.debug("Content script: installing onMessage listener.");
    // Wait for messages from background.js
    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      log.debug("Received message");
      // If our tab changed URL, update the current URL state
      // TODO: make this send/receive part of another file to avoid magic strings
      if (request.message === "tabUrlChanged") {
        log.debug(`New Url!: ${request.url}`);
        setCurrentUrl(request.url);
      }
    });
  }, []);

  return <h1>Hello from extension!</h1>;
}

/**
 * MAIN ENTRY POINT TO DOM BELOW.
 * Inserts the root component into the current page.
 * This is where the frontend design starts.
 * */

// Create CSS Grid/Flex to become the new root ele,ent
// const wrapperDiv = document.createElement("div");
// wrapperDiv.id = "content-script-wrapper";
// // wrapperDiv.className = "static";

// // Move the body's children into this wrapper
// while (document.body.firstChild) {
//   wrapperDiv.appendChild(document.body.firstChild);
// }

// // Make the wrapper div the new body
// document.body.appendChild(wrapperDiv);

// Now append the content as a 1/4th grid col
const contentDiv = document.createElement("div");
contentDiv.id = "content-script-div";
contentDiv.className = "fixed bottom-0 right-0 z-[2000000000]";
document.body.appendChild(contentDiv);
ReactDOM.render(<ContentScriptMain />, contentDiv);

log.debug("Rendered content script.");

/**
 * END OF MAIN ENTRY POINT
 * * */
