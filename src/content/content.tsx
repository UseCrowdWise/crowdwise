import React, { CSSProperties, useEffect, useState } from "react";
import ReactDOM from "react-dom";

function Welcome(props: any) {
    return <h1>Hello,dasdasd{props.name}</h1>;
}

let container = document.createElement('div');
container.setAttribute("id", "app-wrapper");
document.body.appendChild(container);

ReactDOM.render(<Welcome/>, container);
