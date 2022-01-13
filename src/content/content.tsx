import React, { CSSProperties, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import './content.css'

function Welcome(props: any) {
    return <h1>Hello,dasdasd{props.name}</h1>;
}


// Create CSS Grid/Flex at the root
const wrapperDiv = document.createElement("div");
wrapperDiv.id = "content-script-wrapper"
wrapperDiv.className = 'static'

// // Create the wrapper for the existing content
// const mainContentWrapperDiv = document.createElement("div");
// mainContentWrapperDiv.id = "main-content-wrapper"
// mainContentWrapperDiv.className = "col-span-3"
// wrapperDiv.appendChild(mainContentWrapperDiv);

// Move the body's children into this wrapper
while (document.body.firstChild) {
    wrapperDiv.appendChild(document.body.firstChild);
}

// Make the wrapper div the new body
document.body.appendChild(wrapperDiv);

// Now append the content as a 1/4th grid col
const contentDiv = document.createElement("div");
contentDiv.id = "content-script-div";
contentDiv.className = "fixed bottom-0 right-0";
wrapperDiv.appendChild(contentDiv)
ReactDOM.render(<Welcome/>, contentDiv);
