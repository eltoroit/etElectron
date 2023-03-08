// Modules to control application life and create native browser window
const path = require("path");
const { app, BrowserWindow, ipcMain, Menu, dialog, Tray, nativeImage } = require("electron");

class MainProcess {
	quitCounter = 3;

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
		// window.loadURL(homepage);

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
							label: "Menu: Identify",
							click: () => this._identifyComputer(window)
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

	createTray(window) {
		const icon = nativeImage.createFromPath(path.join(__dirname, "../../resources/icon.png"));
		const tray = new Tray(icon);

		tray.setContextMenu(
			Menu.buildFromTemplate([
				{
					label: "Increment",
					click: () => window.webContents.send("mUpdateCounter", 1)
				},
				{
					label: "Decrement",
					click: () => window.webContents.send("mUpdateCounter", -1)
				},
				{
					label: "Tray: Identify",
					click: () => this._identifyComputer(window)
				},
				{
					label: "Quit",
					click: () => app.quit()
				}
			])
		);
		tray.setToolTip("This is my application");
		// tray.setTitle("This is my title"); // MACOSX Shows this to the right of the icon
		return tray;
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
		ipcMain.on("evB2E_Identify", (_event, value) => {
			console.log(value); // will print value to Node console
		});
	}

	start() {
		let window;
		const isDevToolsVisible = true;
		const homepage = path.join(__dirname, "../renderer/index.html");
		// const homepage = `/Users/aperez/GitProjects/current/LWC-OFF/03-LWC+Electron/dist/index.html`;

		// This method will be called when Electron has finished initialization and is ready to create browser windows. Some APIs can only be used after this event occurs.
		app.whenReady().then(() => {
			window = this.createBrowserWindow(homepage, isDevToolsVisible);
			this.createMenu(window);
			this.createTray(window);
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
			if (--this.quitCounter > 0) {
				console.log(`Can't quit! (Try again... ${this.quitCounter})`);
				event.preventDefault();
			}
		});

		this.registerEvents();
	}

	_identifyComputer(window) {
		const os = require("os");
		const interfaces = os.networkInterfaces();

		let data = {
			dttm: new Date().toJSON(),
			networks: []
		};

		for (const interfaceName in interfaces) {
			data.networks.push({
				interfaceName,
				value: interfaces[interfaceName]
			});
		}

		data = JSON.stringify(data, null, 2);
		console.log(data);
		window.webContents.send("evE2B_identify", data);
	}
}
const mp = new MainProcess();
mp.start();
