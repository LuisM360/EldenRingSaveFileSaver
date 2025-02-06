// src/electron/preload.cts
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

// Define type for our exposed API
interface ElectronAPI {
  selectBackupLocation: () => Promise<string | null>;
  getBackupLocation: () => Promise<string | null>;
  backupSave: () => Promise<{ success: boolean; message: string }>;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  selectBackupLocation: () => ipcRenderer.invoke("select-backup-location"),
  getBackupLocation: () => ipcRenderer.invoke("get-backup-location"),
  backupSave: () => ipcRenderer.invoke("backup-save"),
} as ElectronAPI);
