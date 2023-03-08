// Preload scripts are injected before a web page loads in the renderer. All the Node.js APIs are available in the preload process. It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
	versions: {
		node: process.versions.node,
		chrome: process.versions.chrome,
		electron: process.versions.electron
	},
	rPing: () => ipcRenderer.invoke("mPing"),
	rSetTitle: (title) => ipcRenderer.send("mSetTitle", title),
	rDialogOpenFile: () => ipcRenderer.invoke("mDialogOpenFile"),
	rRegisterIdentityHandler: (callback) => ipcRenderer.on("evE2B_identify", callback),
	rRegisterCounterHandler: (callback) => ipcRenderer.on("mUpdateCounter", callback)
});
