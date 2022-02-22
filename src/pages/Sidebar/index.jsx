import React from "react";
import { render } from "react-dom";

import Sidebar from "./Sidebar";
import "../../assets/styles/tailwind.css";

const App = () => {
  return <Sidebar />;
};

render(<App />, window.document.querySelector("#app-container"));
