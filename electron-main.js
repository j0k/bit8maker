// Thin Electron wrapper — loads the same client-side Bit8maker app in a desktop window.
const { app, BrowserWindow, shell } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    width: 980,
    height: 920,
    backgroundColor: "#0e0e10",
    autoHideMenuBar: true,
    // local desktop app: allow fetch() of the bundled wasm over file:// (FLAC encoder)
    webPreferences: { webSecurity: false },
  });
  win.setMenuBarVisibility(false);
  // open external links (GitHub, the metadata URL) in the real browser
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
