// Preload scripts are injected before a web page loads in the renderer. All the Node.js APIs are available in the preload process. It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("versions", {
	node: process.versions.node,
	chrome: process.versions.chrome,
	electron: process.versions.electron
});

contextBridge.exposeInMainWorld("electronAPI", {
	rPing: () => ipcRenderer.invoke("mPing"),
	rSetTitle: (title) => ipcRenderer.send("mSetTitle", title),
	rDialogOpenFile: () => ipcRenderer.invoke("mDialogOpenFile"),
	rRegisterCounterHandler: (callback) => ipcRenderer.on("mUpdateCounter", callback)
});
