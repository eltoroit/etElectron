# Documentation

-   Quick Start
    -   https://www.electronjs.org/docs/latest/tutorial/quick-start
-   Tutorial
    -   https://www.electronjs.org/docs/latest/tutorial/tutorial-first-app
-   Process Model
    -   https://www.electronjs.org/docs/latest/tutorial/process-model
-   Inter-Process Communication
    -   https://www.electronjs.org/docs/latest/tutorial/ipc

# Process Model

-   Two processes
    -   main
    -   renderer
-   Main Process
    -   Single process
    -   Application's entry point
    -   Node.js environment, can use Node.js APIs
    -   Tasks
        -   Window management
            -   Create and manage application windows **BrowserWindow**
            -   Interact with the web content using the window's **webContents** object.
        -   Application lifecycle
            -   Controls app lifecycle using the **app** module
        -   Native Apis
            -   Menus, dialogs, and tray icons
-   Renderer Process
    -   Separate renderer process for each open **BrowserWindow**
    -   Code should behave according to web standards (HTML, CSS, JavaScript)
        -   No access to Node.js
-   Preload Scripts
    -   Like Chrome extensions
    -   Share a global **window** with the renderers.
    -   Runs in a context that has access to both the HTML DOM and a limited subset of Node.js and Electron APIs.
        -   They are granted more privileges by having access to Node.js APIs.
        -   _Execute in a renderer_ (before web content begins loading)
-   Just know and think they are different
    -   Code the Renderer web app like you would code without Electron
        -   Except that you can assume your app will be running in Chrome, no need to build for multiple browsers
        -   Befine your own API contract, think of calling Electron as making web services calls (different syntax, but same idea)
    -   Code the Main process like if you were building a web server
        -   Just respond to calls as if they were web service calls (different syntax, but same idea)
    -   Keep your app decoupled, and therefore, more secure.

# Inter-Process Communication

-   Processes communicate by passing messages through developer-defined "channels" with the **ipcMain** and **ipcRenderer** modules
-   **Pattern 1: Renderer to main (one-way)**

    -   _Renderer_ => _Preload_ => _Main_

    | Process    | Code                                                                                                             |
    | ---------- | ---------------------------------------------------------------------------------------------------------------- |
    | _Renderer_ | `window.electronAPI.rRetTitle("title")`                                                                          |
    | _Preload_  | `contextBridge.exposeInMainWorld('electronAPI', { rSetTitle: (title) => ipcRenderer.send('mSetTitle', title) })` |
    | _Main_     | `ipcMain.on('mSetTitle', (event, title) => { ... }`                                                              |

-   **Pattern 2: Renderer to main (two-way)**

    -   _Renderer_ => _Preload_ => _Main_ => _Preload_ => _Renderer_

    | Process    | Code                                               |
    | ---------- | -------------------------------------------------- |
    | _Renderer_ | `await window.electronAPI.rOpenFile()...`          |
    | _Preload_  | `rOpenFile: () => ipcRenderer.invoke('mOpenFile')` |
    | _Main_     | `ipcMain.handle('mOpenFile', () => {...})`         |
    | _Renderer_ | `...then(data => {...})`                           |

-   **Pattern 3: Main to renderer**

    -   _Main_ => _Preload_ => _Renderer_ => _Preload_ => _Main_

    | Process    | Code                                                                                                               |
    | ---------- | ------------------------------------------------------------------------------------------------------------------ |
    | _Main_     | `mainWindow.webContents.send("mUpdateCounter", 1)`                                                                 |
    | _Preload_  | `rRegisterCounterHandler: (callback) => ipcRenderer.on("mUpdateCounter", callback)`                                |
    | _Renderer_ | `window.electronAPI.rRegisterCounterHandler((event, value) => { event.sender.send("mCounterValue", newValue); });` |
    | _Main_     | `ipcMain.on("mCounterValue", (_event, value) => { ... });`                                                         |
