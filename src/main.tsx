import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App";
import { registerServiceWorker } from "./utils/registerServiceWorker";
import "./styles/index.css";

const localShellProtocols = new Set(["file:", "tauri:", "capacitor:"]);
const localShellHosts = new Set(["tauri.localhost", "ql.localhost", "capacitor.localhost"]);
const Router =
  localShellProtocols.has(window.location.protocol) || localShellHosts.has(window.location.hostname)
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
