import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./content.css";

import { log } from "../utils/log";

import { ContentButtonWithSideBar } from "./ContentButton";
import { ProviderResults, ProviderResultType } from "../providers/providers";

/**
 * CONTENT SCRIPT.
 *
 * One instance of this script runs on each tab.
 * Calls the background script every time its URL changes.
 * Or re-calls the background script when it tells the content script that the URL has changed w/o a full page reload.
 *
 * Primarily responsible for displaying the results on the screen and handling user interaction.
 *  * */

const ContentScriptMain = () => {
  // const [currentUrl, setCurrentUrl] = useState(window.location.href);
  const [providerData, setProviderData] = useState<ProviderResults>({
    resultType: ProviderResultType.Ok,
    hackerNews: [],
    reddit: [],
  });

  // Execute only when the extension button is clicked
  const onClicked = () => {
    // Starting useEffect call from content script
    log.debug("Starting call to providers");

    // Initiate the call to background script to get data from providers
    const getConversationData = async () => {
      chrome.runtime.sendMessage(
        { windowUrl: window.location.href },
        (response: ProviderResults) => {
          log.debug("Printing provider data from background script...");
          log.debug(response);
          setProviderData(response);
        }
      );
    };
    // Actually run the async function
    getConversationData().catch(console.error);
  };

  // Registers callback to handle new messages from chrome background script
  // useEffect(() => {
  //   log.debug("Content script: installing onMessage listener.");
  //   // Wait for messages from background.js
  //   chrome.runtime.onMessage.addListener(function (
  //     request,
  //     sender,
  //     sendResponse
  //   ) {
  //     log.debug("Received message");
  //     // If our tab changed URL, update the current URL state
  //     // TODO: make this send/receive part of another file to avoid magic strings
  //     if (request.message === "tabUrlChanged") {
  //       log.debug(`New Url!: ${request.url}`);
  //       setCurrentUrl(request.url);
  //     }
  //   });
  // }, []);

  return (
    <ContentButtonWithSideBar
      onClicked={onClicked}
      providerData={providerData}
    />
  );
};

/**
 * MAIN ENTRY POINT TO DOM BELOW.
 * Inserts the root component into the current page.
 * This is where the frontend design starts.
 * */

window.addEventListener("load", () => {
  // Creates the root element for the shadow DOM to attach to
  // Unset all styles so that the current page's styles won't make this div appear
  const contentDiv = document.createElement("div");
  contentDiv.id = "content-script-div";
  contentDiv.setAttribute("style", "all:unset;"); // Avoid grabbing existing styles
  document.body.appendChild(contentDiv);

  // Create the shadow dom in the unstyled div we created
  const shadow = contentDiv.attachShadow({ mode: "open" });
  // I have no idea what this part is for, but one of the many guides had this
  shadow.innerHTML = `

  <style>
  :host {
    all: initial;
  }
  </style>
  `;

  // CRUCIAL: this adds the content.css into the shadow dom itself as a stylesheet
  // Needs the manifest.json to have the content.css as a web accessible resource
  const linkElem = document.createElement("link");
  linkElem.setAttribute("rel", "stylesheet");
  linkElem.setAttribute(
    "href",
    chrome.runtime.getURL("static/css/content.css")
  );
  shadow.appendChild(linkElem);

  // Finally we can add in the actual react root element
  const injectDOM = document.createElement("div");
  shadow.appendChild(injectDOM);
  ReactDOM.render(<ContentScriptMain />, injectDOM);

  log.debug("Rendered content script.");
});
/**
 * END OF MAIN ENTRY POINT
 * * */
