import React from "react";
import { render } from "react-dom";

import "../../assets/styles/tailwind.css";
import Options from "./Options";

render(
  <Options title={"Settings"} />,
  window.document.querySelector("#app-container")
);

if (module.hot) module.hot.accept();
