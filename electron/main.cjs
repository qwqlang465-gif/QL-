const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("node:path");

const isDevelopment = process.env.NODE_ENV === "development";

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1100,
    height: 820,
    minWidth: 390,
    minHeight: 640,
    title: "QL",
    backgroundColor: "#f4ecd8",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.once("ready-to-show", () => {
    window.show();
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
    }

    return { action: "deny" };
  });

  if (isDevelopment && process.env.QL_ELECTRON_DEV_URL) {
    window.loadURL(process.env.QL_ELECTRON_DEV_URL);
    window.webContents.openDevTools({ mode: "detach" });
  } else {
    window.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
