import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App";
import { registerServiceWorker } from "./utils/registerServiceWorker";
import "./styles/index.css";

const localShellProtocols = new Set(["file:", "tauri:"]);
const Router =
  localShellProtocols.has(window.location.protocol) || window.location.hostname === "tauri.localhost"
    ? HashRouter
    : BrowserRouter;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
);

registerServiceWorker();
