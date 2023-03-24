export default class MyCode {
	constructor() {
		debugger;
		setTimeout(() => {
			window.electronAPI.R2M2R_Ping().then((response) => {
				console.log(response);
			});
		}, 100);

		this.printVersions();
		this.setTitle();
		this.openFile();
		this.counter();
		this.identity();
	}

	printVersions() {
		const information = document.getElementById("info");
		information.innerHTML = `This app is using Chromium (v${window.electronAPI.versions.chrome}),<br/>
		                         Node.js (v${window.electronAPI.versions.node}),<br/>
		                         and Electron (v${window.electronAPI.versions.electron})`;
	}

	setTitle() {
		const setButton = document.getElementById("btnTitle");
		const titleInput = document.getElementById("title");
		setButton.addEventListener("click", () => {
			const title = titleInput.value;
			window.electronAPI.R2M_SetTitle(title);
		});
	}

	openFile() {
		const btn = document.getElementById("btnFile");
		const filePathElement = document.getElementById("filePath");
		btn.addEventListener("click", async () => {
			const filePath = await window.electronAPI.R2M2R_DialogOpenFile();
			filePathElement.innerText = filePath;
		});
	}

	counter() {
		const counter = document.getElementById("counter");
		window.electronAPI.M2R_UpdateCounter((event, value) => {
			const oldValue = Number(counter.innerText);
			const newValue = oldValue + value;
			counter.innerText = newValue;
			event.sender.send("R2M_CounterValue", newValue);
		});
	}

	identity() {
		const identity = document.getElementById("identity");
		window.electronAPI.M2R_Identity((event, value) => {
			console.log(value);
			identity.textContent = value;
			event.sender.send("M2R_Identity", value);
		});
	}
}
