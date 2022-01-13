import React, { CSSProperties, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import './content.css'
import { testFunction } from './test_import'

function Welcome(props: any) {
    return <h1>Hello from extension!</h1>;
}



/**
 * MAIN ENTRY POINT BELOW.
 * Inserts the root component into the current page.
 * This is where the frontend design starts.
 * */


// Create CSS Grid/Flex to become the new root ele,ent
const wrapperDiv = document.createElement("div");
wrapperDiv.id = "content-script-wrapper"
wrapperDiv.className = 'static'

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

testFunction();
