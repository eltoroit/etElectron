// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Menu, dialog } = require("electron");
const path = require("path");

class MainProcess {
	createBrowserWindow(homepage, isDevToolsVisible) {
		const window = new BrowserWindow({
			// width: 800,
			// height: 600,
			width: 1920,
			height: 1080,
			webPreferences: {
				preload: path.join(__dirname, "../preload/preload.js")
			}
		});
		window.loadFile(homepage);

		if (isDevToolsVisible) {
			window.webContents.openDevTools();
		}

		return window;
	}

	createMenu(window) {
		Menu.setApplicationMenu(
			Menu.buildFromTemplate([
				{
					label: app.name,
					submenu: [
						{
							label: "Increment",
							click: () => window.webContents.send("mUpdateCounter", 1)
						},
						{
							label: "Decrement",
							click: () => window.webContents.send("mUpdateCounter", -1)
						},
						{
							label: "Quit",
							accelerator: process.platform === "darwin" ? "Cmd+Q" : "Alt+F4",
							click: () => app.quit()
						}
					]
				}
			])
		);
	}

	registerEvents() {
		ipcMain.handle("mPing", async () => {
			return "pong";
		});
		ipcMain.handle("mDialogOpenFile", () => {
			return new Promise((resolve, reject) => {
				dialog
					.showOpenDialog()
					.then(({ canceled, filePaths }) => {
						if (canceled) {
							resolve;
						} else {
							resolve(filePaths[0]);
						}
					})
					.catch((err) => reject(err));
			});
		});
		ipcMain.on("mSetTitle", (event, title) => {
			const webContents = event.sender;
			const win = BrowserWindow.fromWebContents(webContents);
			win.setTitle(title);
		});
		ipcMain.on("mCounterValue", (_event, value) => {
			console.log(value); // will print value to Node console
		});
	}

	start() {
		let window;
		const isDevToolsVisible = true;
		const homepage = path.join(__dirname, "../renderer/index.html");

		// This method will be called when Electron has finished initialization and is ready to create browser windows. Some APIs can only be used after this event occurs.
		app.whenReady().then(() => {
			window = this.createBrowserWindow(homepage, isDevToolsVisible);
			this.createMenu(window);
			app.on("activate", () => {
				// On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
				if (BrowserWindow.getAllWindows().length === 0) {
					window = this.createBrowserWindow(homepage, isDevToolsVisible);
					this.createMenu(window);
				}
			});
		});

		// Quit when all windows are closed, except on macOS. There, it's common for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q.
		app.on("window-all-closed", () => {
			if (process.platform !== "darwin") app.quit();
		});

		app.on("before-quit", (event) => {
			console.log("Can't quit! (Use frute force! :-)");
			event.preventDefault();
		});

		this.registerEvents();
	}
}
const mp = new MainProcess();
mp.start();
