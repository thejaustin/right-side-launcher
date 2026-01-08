/// <reference types="vite/client" />

interface AppData {
  name: string;
  path: string; // Path to the shortcut (.lnk)
  target: string; // Actual exe path
}

interface ElectronAPI {
  resizeWindow: (expanded: boolean) => Promise<void>;
  getApps: () => Promise<AppData[]>;
  launchApp: (path: string) => Promise<void>;
}

interface Window {
  electronAPI: ElectronAPI;
}