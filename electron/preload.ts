import { contextBridge, ipcRenderer } from 'electron'

console.log("PRELOAD SCRIPT RUNNING...");

try {
    contextBridge.exposeInMainWorld('electronAPI', {
      resizeWindow: (expanded: boolean) => ipcRenderer.invoke('resize-window', expanded),
      getApps: () => ipcRenderer.invoke('get-apps'),
      launchApp: (path: string) => ipcRenderer.invoke('launch-app', path),
    })
    console.log("API EXPOSED SUCCESSFULLY");
} catch (error) {
    console.error("FAILED TO EXPOSE API:", error);
}