// Modules to control application life and create native browser window
const path = require("path");
const { app, BrowserWindow, ipcMain, Menu, dialog, Tray, nativeImage } = require("electron");

class MainProcess {
	quitCounter = -1; // Old value was 3 preventing the app from closing, until really desired to do so :-)

	createBrowserWindow(homepage, isDevToolsVisible) {
		const window = new BrowserWindow({
			// width: 800,
			// height: 600,
			width: 1920,
			height: 1080,
			webPreferences: {
				preload: path.join(__dirname, "../preload/preload.cjs")
			}
		});

		if (isDevToolsVisible) {
			window.webContents.openDevTools();
		}

		setTimeout(() => {
			window.loadFile(homepage);
			// window.loadURL(homepage);
		}, 5e3);

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
							click: () => {
								window.webContents.send("M2R_UpdateCounter", 1);
							}
						},
						{
							label: "Decrement",
							click: () => window.webContents.send("M2R_UpdateCounter", -1)
						},
						{
							label: "Menu: Computer Id",
							click: () => window.webContents.send("M2R_Identity", this.#getComputerId(window))
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
					click: () => window.webContents.send("M2R_UpdateCounter", 1)
				},
				{
					label: "Decrement",
					click: () => window.webContents.send("M2R_UpdateCounter", -1)
				},
				{
					label: "Tray: Computer Id",
					click: () => window.webContents.send("M2R_Identity", this.#getComputerId(window))
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
		ipcMain.handle("R2M2R_Ping", async () => {
			console.log("Ping");
			return "pong"; // Promise resolves
		});
		ipcMain.handle("R2M2R_DialogOpenFile", async () => {
			let { canceled, filePaths } = await dialog.showOpenDialog();
			return canceled ? null : filePaths[0];
		});
		ipcMain.on("R2M_SetTitle", (event, title) => {
			const webContents = event.sender;
			const win = BrowserWindow.fromWebContents(webContents);
			win.setTitle(title);
		});
		ipcMain.on("R2M_CounterValue", (event, value) => {
			console.log(value); // will print value to Node console
		});
		ipcMain.on("R2M_Identity", (event, value) => {
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

		app.on("window-all-closed", () => {
			// Quit when all windows are closed, except on macOS. There, it's common for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q.
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

	#getComputerId() {
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
		// console.log(data);
		return data;
	}
}
const mp = new MainProcess();
mp.start();
