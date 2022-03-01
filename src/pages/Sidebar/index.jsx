import React from "react";
import { render } from "react-dom";

import "../../assets/styles/tailwind.css";
import Sidebar from "./Sidebar";

const App = () => {
  return <Sidebar />;
};

render(<App />, window.document.querySelector("#app-container"));
