const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("path");

const TARGET_URL = process.env.KAAMSETU_APP_URL || "https://kaamsetu-neon.vercel.app";
const ALLOWED_ORIGIN = new URL(TARGET_URL).origin;

let mainWindow = null;

function createMenu(win) {
  const navigate = (route) => {
    if (win && !win.isDestroyed()) {
      win.loadURL(`${ALLOWED_ORIGIN}${route}`);
    }
  };

  const template = [
    {
      label: "KAAMSETU",
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Navigate",
      submenu: [
        { label: "Home", accelerator: "CmdOrCtrl+1", click: () => navigate("/") },
        { label: "Find Professionals", accelerator: "CmdOrCtrl+2", click: () => navigate("/explore") },
        { label: "Universal Translator", accelerator: "CmdOrCtrl+3", click: () => navigate("/translate") },
        { label: "Create Skill Profile", accelerator: "CmdOrCtrl+4", click: () => navigate("/onboarding") },
        { type: "separator" },
        { role: "reload" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 360,
    minHeight: 600,
    backgroundColor: "#F7F5F0",
    title: "KAAMSETU — Skill Identity & Workforce Platform",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  createMenu(mainWindow);

  // Open external origins safely in the system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") && !url.startsWith(ALLOWED_ORIGIN)) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  mainWindow.webContents.on("did-fail-load", () => {
    mainWindow.loadFile(path.join(__dirname, "..", "mobile", "index.html"));
  });

  mainWindow.loadURL(TARGET_URL);
}

app.setAsDefaultProtocolClient("kaamsetu");

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
