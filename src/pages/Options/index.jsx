import React from "react";
import { render } from "react-dom";

import Options from "./Options";
import "../../assets/styles/tailwind.css";

render(
  <Options title={"Settings"} />,
  window.document.querySelector("#app-container")
);

if (module.hot) module.hot.accept();
