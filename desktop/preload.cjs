const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("kaamsetuDesktop", {
  isElectron: true,
  platform: process.platform,
});
