import { app, BrowserWindow, dialog, ipcMain } from "electron";
import Store from "electron-store";
import path from "path";
import fs from "fs";
import os from "os";
import { isDev } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";

const store = new Store();

function getEldenRingSaveLocation(): string | null {
  const platform = process.platform;

  if (platform !== "win32") {
    console.warn("Elden Ring save location is only supported on Windows.");
    return null;
  }

  const appDataPath = path.join(
    os.homedir(),
    "AppData",
    "Roaming",
    "EldenRing"
  );

  // Check if the EldenRing directory exists
  if (!fs.existsSync(appDataPath)) {
    console.warn("Elden Ring save directory not found:", appDataPath);
    return null;
  }

  return appDataPath;
}

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 440,
    height: 600,
    resizable: false,
    maximizable: false,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true, // Enable context isolation for security
      nodeIntegration: false, // Disable node integration for security
    },
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123/");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "dist-react/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("select-backup-location", async () => {
  if (!mainWindow) return null;

  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
      title: "Select Backup Location",
    });

    if (!result.canceled) {
      const backupLocation = result.filePaths[0];
      store.set("backupLocation", backupLocation);
      return backupLocation;
    }
    return null;
  } catch (error) {
    console.error("Error selecting backup location:", error);
    return null;
  }
});

ipcMain.handle("get-backup-location", () => {
  try {
    return store.get("backupLocation", null);
  } catch (error) {
    console.error("Error getting backup location:", error);
    return null;
  }
});

ipcMain.handle("backup-save", async () => {
  const eldenRingSaveLocation = getEldenRingSaveLocation();
  const backupLocation = store.get("backupLocation") as string | undefined;

  if (!eldenRingSaveLocation) {
    return {
      success: false,
      message: "Could not determine Elden Ring save location.",
    };
  }

  if (!backupLocation) {
    return { success: false, message: "No backup location selected." };
  }

  try {
    // Create timestamp in 12-hour format: "YYYY-MM-DD hh-mm-ss AM/PM"
    const now = new Date();
    const timestamp = now
      .toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      .replace(/[/:]/g, "-")
      .replace(",", "");

    const backupPath = path.join(backupLocation, `backup-${timestamp}`);

    // Create backup directory if it doesn't exist
    await fs.promises.mkdir(backupPath, { recursive: true });

    // Copy files
    await fs.promises.cp(eldenRingSaveLocation, backupPath, {
      recursive: true,
      preserveTimestamps: true,
    });

    return {
      success: true,
      message: `Backup completed successfully to ${backupPath}!`,
    };
  } catch (error) {
    console.error("Backup failed:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
});
