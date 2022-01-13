import React, { CSSProperties, useEffect, useState } from "react";
import ReactDOM from "react-dom";

function Welcome(props: any) {
    return <h1>Hello,dasdasd{props.name}</h1>;
}


const contentDiv = document.createElement("div");
contentDiv.setAttribute("id", "content-script-div");
document.body.appendChild(contentDiv)
ReactDOM.render(<Welcome/>, contentDiv);
