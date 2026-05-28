const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("qlDesktop", {
  platform: process.platform,
});
