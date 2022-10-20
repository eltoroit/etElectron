const information = document.getElementById("info");
information.innerHTML = `This app is using Chromium (v${versions.chrome}),<br/>
                         Node.js (v${versions.node}),<br/>
                         and Electron (v${versions.electron})`;

setTimeout(() => {
	window.electronAPI.rPing().then((response) => {
		alert(response);
	});
}, 100);

// Title
const setButton = document.getElementById("btnTitle");
const titleInput = document.getElementById("title");
setButton.addEventListener("click", () => {
	const title = titleInput.value;
	window.electronAPI.rSetTitle(title);
});

// Open Folder
const btn = document.getElementById("btnFile");
const filePathElement = document.getElementById("filePath");

btn.addEventListener("click", async () => {
	const filePath = await window.electronAPI.rDialogOpenFile();
	filePathElement.innerText = filePath;
});

// Counter
const counter = document.getElementById("counter");
window.electronAPI.rRegisterCounterHandler((event, value) => {
	const oldValue = Number(counter.innerText);
	const newValue = oldValue + value;
	counter.innerText = newValue;
	event.sender.send("mCounterValue", newValue);
});
