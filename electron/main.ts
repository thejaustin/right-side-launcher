import { app, BrowserWindow, screen, ipcMain, shell, globalShortcut, Menu } from 'electron'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeFileSync, readFileSync, existsSync, readdirSync, statSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = join(app.getPath('userData'), 'apps-cache.json');

process.env.DIST = join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : join(__dirname, '../public')

let win: BrowserWindow | null
const PRELOAD_JS_URL = join(__dirname, 'preload.mjs')
let cachedApps: any[] = [];

// Load Cache
try {
    if (existsSync(CACHE_PATH)) cachedApps = JSON.parse(readFileSync(CACHE_PATH, 'utf-8'));
} catch (e) {}

// NATIVE SCANNER
function scanDir(dir: string, depth: number): any[] {
    if (depth > 3) return []; 
    let results: any[] = [];
    const junkKeywords = [
        'uninstall', 'help', 'manual', 'readme', 'documentation', 
        'website', 'license', 'changelog', 'support', 'about',
        'vignette', 'credits', 'config', 'setup', 'remove'
    ];

    try {
        const files = readdirSync(dir);
        for (const file of files) {
            const fullPath = join(dir, file);
            try {
                const stat = statSync(fullPath);
                if (stat.isDirectory()) {
                    results = results.concat(scanDir(fullPath, depth + 1));
                } else if (file.toLowerCase().endsWith('.lnk')) {
                     const name = file.slice(0, -4);
                     const isJunk = junkKeywords.some(k => name.toLowerCase().includes(k));
                     if (!isJunk) {
                         results.push({ name: name, path: fullPath });
                     }
                }
            } catch (e) {} 
        }
    } catch (e) {} 
    return results;
}

async function fetchApps() {
    const commonStart = join(process.env.ProgramData || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs');
    const userStart = join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs');
    
    let apps = [
        ...scanDir(commonStart, 0),
        ...scanDir(userStart, 0)
    ];

    apps = Array.from(new Map(apps.map((item) => [item.name, item])).values());
    apps.sort((a, b) => a.name.localeCompare(b.name));

    win?.webContents.send('apps-loaded', apps);

    const appsWithIcons = [];
    for (const appItem of apps) {
        try {
            let iconPath = appItem.path;
            if (appItem.path.toLowerCase().endsWith('.lnk')) {
                try {
                    const shortcut = shell.readShortcutLink(appItem.path);
                    if (shortcut.target && shortcut.target.length > 0) {
                        iconPath = shortcut.target;
                    }
                } catch (e) {}
            }

            const icon = await app.getFileIcon(iconPath, { size: 'large' });
            const iconData = icon.toDataURL();
            const updatedApp = { ...appItem, icon: iconData };
            appsWithIcons.push(updatedApp);
            
            if (appsWithIcons.length % 5 === 0) {
                win?.webContents.send('apps-loaded', [...appsWithIcons, ...apps.slice(appsWithIcons.length)]);
            }
        } catch (err) {
            appsWithIcons.push({ ...appItem, icon: null });
        }
    }
    
    cachedApps = appsWithIcons;
    win?.webContents.send('apps-loaded', appsWithIcons);
    try { writeFileSync(CACHE_PATH, JSON.stringify(appsWithIcons)); } catch(e) {}
    return appsWithIcons;
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  win = new BrowserWindow({
    width: width, 
    height: height,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: PRELOAD_JS_URL,
      devTools: false,
      nodeIntegration: true, 
      contextIsolation: false, 
      sandbox: false,
    },
  })

  win.setAlwaysOnTop(true, 'screen-saver');

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(join(process.env.DIST || '', 'index.html'))
  }

  win.webContents.on('did-finish-load', () => {
    if (cachedApps.length > 0) win?.webContents.send('apps-loaded', cachedApps);
  });
}

ipcMain.handle('launch-app', (_event, path) => shell.openPath(path))
ipcMain.handle('get-apps-force', () => cachedApps)
ipcMain.handle('set-always-on-top', (_event, flag) => {
    if (win) {
        win.setAlwaysOnTop(flag, 'screen-saver');
        return win.isAlwaysOnTop();
    }
    return false;
})

ipcMain.handle('update-window-layout', (_event, _layout) => {
    // Fulscreen window logic
})

ipcMain.handle('show-app-context-menu', async (event, isPinned) => {
    return new Promise((resolve) => {
        const menu = Menu.buildFromTemplate([
            {
                label: isPinned ? 'Unpin from Top' : 'Pin to Top',
                click: () => resolve('toggle-pin')
            },
            { type: 'separator' },
            {
                label: 'Open File Location',
                click: () => {
                    resolve('open-folder');
                }
            }
        ]);
        menu.popup({ window: BrowserWindow.fromWebContents(event.sender) || undefined });
        menu.on('menu-will-close', () => resolve(null));
    });
})

ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    // Use an explicit check for the options to ensure clicks work when ignore is false
    if (ignore) {
        win?.setIgnoreMouseEvents(true, options || { forward: true });
    } else {
        win?.setIgnoreMouseEvents(false);
    }
});

app.whenReady().then(() => {
    createWindow();
    fetchApps();

    globalShortcut.register('Alt+Space', () => {
        if (win) {
            win.webContents.send('toggle-launcher');
        }
    });
})

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); win = null; })