# Documentation

-   Quick Start
    -   https://www.electronjs.org/docs/latest/tutorial/quick-start
-   Tutorial
    -   https://www.electronjs.org/docs/latest/tutorial/tutorial-first-app

# Process Model

-   https://www.electronjs.org/docs/latest/tutorial/process-model
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
    -   Code should behave according to web standards (HTML, CSS, JavaScript (<script />))
        -   No access to Node.js
-   Preload Scripts
    -   Like Chrome extensions
    -   _Execute in a renderer_ (before web content begins loading)
    -   They are granted more privileges by having access to Node.js APIs.
    -   Share a global **window** with the renderers.
