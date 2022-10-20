export default class MyCode {
	constructor() {
		setTimeout(() => {
			window.electronAPI.rPing().then((response) => {
				console.log(response);
			});
		}, 100);

		this.printVersions();
		this.setTitle();
		this.openFile();
		this.counter();
	}

	printVersions() {
		const information = document.getElementById("info");
		information.innerHTML = `This app is using Chromium (v${electronAPI.versions.chrome}),<br/>
		                         Node.js (v${electronAPI.versions.node}),<br/>
		                         and Electron (v${electronAPI.versions.electron})`;
	}

	setTitle() {
		const setButton = document.getElementById("btnTitle");
		const titleInput = document.getElementById("title");
		setButton.addEventListener("click", () => {
			const title = titleInput.value;
			window.electronAPI.rSetTitle(title);
		});
	}

	openFile() {
		const btn = document.getElementById("btnFile");
		const filePathElement = document.getElementById("filePath");
		btn.addEventListener("click", async () => {
			const filePath = await window.electronAPI.rDialogOpenFile();
			filePathElement.innerText = filePath;
		});
	}

	counter() {
		const counter = document.getElementById("counter");
		window.electronAPI.rRegisterCounterHandler((event, value) => {
			const oldValue = Number(counter.innerText);
			const newValue = oldValue + value;
			counter.innerText = newValue;
			event.sender.send("mCounterValue", newValue);
		});
	}
}
