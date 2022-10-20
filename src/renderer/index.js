const information = document.getElementById("info");
information.innerHTML = `This app is using Chromium (v${versions.chrome}),<br/>
                         Node.js (v${versions.node}),<br/>
                         and Electron (v${versions.electron})`;

setTimeout(() => {
	window.electron.rendererPing().then((response) => {
		alert(response);
	});
}, 100);
