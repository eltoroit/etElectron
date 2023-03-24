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
        -   Define your own API contract, think of calling Electron as making web services calls (different syntax, but same idea)
    -   Code the Main process like if you were building a web server
        -   Just respond to calls as if they were web service calls (different syntax, but same idea)
    -   Keep your app decoupled, and therefore, more secure.

# Inter-Process Communication

-   Processes communicate by passing messages through developer-defined "channels" with the **ipcMain** and **ipcRenderer** modules

## Pattern 1: `R2M`: Renderer to main [one-way]

-   `Renderer => Preload => Main`
-   Notify MAIN that user performed action on the RENDERER
-   Setup
    -   MAIN must register the handler `ipcMain.on("R2M_SetTitle", ...)`

| Action | Process  | Concepts                                            | Sample                                                             |
| ------ | -------- | --------------------------------------------------- | ------------------------------------------------------------------ |
| 1      | Renderer | `Call` function on preload                          | `window.electronAPI.R2M_SetTitle("title")`                         |
| 2      | Preload  | Defines function that calls `send()` on ipcRenderer | `R2M_SetTitle: (title) => ipcRenderer.send("R2M_SetTitle", title)` |
| 3      | Main     | Register event handler using `on`                   | `ipcMain.on("R2M_SetTitle", (event, title) => { ... }`             |

## Pattern 2: `R2M2R`: Renderer to main [two-way]

-   `Renderer => Preload => Main => Preload => Renderer`
-   RENDERER is asking a question to MAIN and it's expecting an answer back
-   Setup
    -   MAIN must register the handler `ipcMain.handle("R2M2R_DialogOpenFile", ...)`

| Step | Process  | Concepts                                              | Sample                                                                   |
| ---- | -------- | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| 1    | Renderer | `Await` a function on preload                         | `await window.electronAPI.R2M2R_DialogOpenFile()...`                     |
| 2    | Preload  | Defines function that calls `invoke()` on ipcRenderer | `R2M2R_DialogOpenFile: () => ipcRenderer.invoke("R2M2R_DialogOpenFile")` |
| 3    | Main     | Register event handler using `handle` (promise)       | `ipcMain.handle("R2M2R_DialogOpenFile", async () => { ... })`            |
| 4    | Renderer | Receives response when promise resolves               | `...then(data => { ... })`                                               |

## Pattern 3: `M2R`: Main to renderer

-   `Main => Preload => Renderer`
-   MAIN is notifying RENDERER something happen
-   Setup
    -   RENDERER must register the handler by calling a function on the preload `window.electronAPI.M2R2M_UpdateCounterHandler( ... );`
-   Optional: RENDERER sends an aswer back
    -   Similar to pattern #1 (Renderer to main (one-way)), but bypasses the preload since there is a communication channel opened
    -   Renderer calls send() function: `event.sender.send("mCounterValue", newValue);`

| Process  | Concepts                                                 | Sample                                                                                  |
| -------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Main     | `Send` event                                             | `mainWindow.webContents.send("M2R_UpdateCounter", 1)`                                   |
| Preload  | Defines function that registers event handler using `on` | `M2R_UpdateCounterHandler: (callback) => ipcRenderer.on("M2R_UpdateCounter", callback)` |
| Renderer | Register event handler by calling function               | `window.electronAPI.M2R2M_UpdateCounterHandler((event, value) => { ... });`             |

## Pattern 4: Renderer to renderer

-   Two options
    -   Use the main process as a message broker between renderers
    -   Pass a **MessagePort** from the main process to both renderers, allows direct communication between renderers.
        -   https://www.electronjs.org/docs/latest/tutorial/message-ports
