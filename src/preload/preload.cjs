// Preload scripts are injected before a web page loads in the renderer. All the Node.js APIs are available in the preload process. It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
	versions: {
		node: process.versions.node,
		chrome: process.versions.chrome,
		electron: process.versions.electron
	},
	R2M2R_Ping: () => ipcRenderer.invoke("R2M2R_Ping"),
	R2M_SetTitle: (title) => ipcRenderer.send("R2M_SetTitle", title),
	R2M2R_DialogOpenFile: () => ipcRenderer.invoke("R2M2R_DialogOpenFile"),
	M2R_UpdateCounter: (callback) => ipcRenderer.on("M2R_UpdateCounter", callback),
	M2R_Identity: (callback) => ipcRenderer.on("M2R_Identity", callback)
});
