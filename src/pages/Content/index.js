import { printLine } from "./modules/print";
import ReactDOM from "react-dom";
import { APP_NAME_SHORT } from "../../shared/constants";
import cx from "classnames";
import React, { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
// import './helpers/SidebarHelper';

console.log("Content script works!");
console.log("Must reload extension for modifications to take effect.");

printLine("Using the 'printLine' function from the Print Module");

let sidebarRoot = document.createElement("div");
// sidebarRoot.innerText = "HELLO WORLD!";
sidebarRoot.style["height"] = "100vh";
sidebarRoot.style["top"] = 0;
sidebarRoot.style["right"] = 0;
sidebarRoot.style["position"] = "fixed";
sidebarRoot.style["zIndex"] = 999999999;

document.body.appendChild(sidebarRoot);
sidebarRoot.setAttribute("id", "vt-sidebar-root");

// First react component that is rendered onto vt-sidebar-root
// This had to be a class so we can mount and unmount chrome listeners
class App extends React.Component {
  constructor() {
    super();
    this.state = {
      shouldShowSideBar: true,
    };
    this.handleMessage.bind(this);
  }
  componentDidMount() {
    // Add listener when component mounts
    chrome.runtime.onMessage.addListener(this.handleMessage);
  }
  componentWillUnmount() {
    // Remove listener when this component unmounts
    chrome.runtime.onMessage.removeListener(this.handleMessage);
  }

  // Close the side bar based on incoming message from further down in the component (close arrow)
  handleMessage = (request, sender, sendResponse) => {
    console.log(
      sender.tab
        ? "from a content script:" + sender.tab.url
        : "from the extension"
    );
    if (request.closeSideBar === true) {
      this.setState({ shouldShowSideBar: false });
    }
  };

  render() {
    return (
      <div>
        <iframe
          title="sidebar-iframe"
          style={{
            width: this.state.shouldShowSideBar ? "auto" : "0",
            height: "100vh",
            border: "none",
            borderSizing: "border-box",
            opacity: 0.95,
          }}
          src={chrome.runtime.getURL("sidebar.html")}
          // ref={(frame) => (this.frame = frame)}
          onLoad={() => console.log("iFrame loaded")}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, sidebarRoot);
