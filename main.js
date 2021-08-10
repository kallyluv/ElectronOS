const uuid = require("uuidv4").uuid;
const fs = require("fs");

/**
 * @param {Element} appWindow
 */
function initAppWindow(appWindow) {
	this.appWindow = appWindow;
	this.windowControls = document.createElement("div");
	this.windowControls.classList.add("window-controls");
	this.windowControls.close = document.createElement("button");
	this.windowControls.close.classList.add("control");
	this.windowControls.close.setAttribute("data-control", "close");
	this.windowControls.close.setAttribute("data-icon", "✕");
	this.windowControls.close.tabIndex = -1;
	this.windowControls.minimize = document.createElement("button");
	this.windowControls.minimize.classList.add("control");
	this.windowControls.minimize.setAttribute("data-control", "minimize");
	this.windowControls.minimize.setAttribute("data-icon", "—");
	this.windowControls.minimize.tabIndex = -1;
	this.windowControls.maximize = document.createElement("button");
	this.windowControls.maximize.classList.add("control");
	this.windowControls.maximize.setAttribute("data-control", "maximize");
	this.windowControls.maximize.setAttribute("data-icon", "⤡");
	this.windowControls.maximize.tabIndex = -1;
	this.windowControls.append(
		this.windowControls.close,
		this.windowControls.minimize,
		this.windowControls.maximize
	);
	this.windowControls.close.addEventListener("click", () => {
		this.windowControls.parentElement.parentElement.style.transform =
			"scale(0)";
	});
	window.addEventListener("click", (e) => {
		if (e.target !== this.appWindow && !this.appWindow.contains(e.target))
			this.appWindow.removeAttribute("active");
	});
	this.appWindow.setAttribute("windowID", uuid());
	this.appWindow.querySelector(".header").prepend(this.windowControls);
	this.appWindow
		.querySelector(".header")
		.addEventListener("dblclick", (event) => {
			(() => {
				document
					.querySelectorAll(".app-window[active]")
					.forEach((appWindow) =>
						appWindow.removeAttribute("active")
					);
				this.appWindow.setAttribute("active", true);
				windowHistory.splice(
					windowHistory.indexOf(
						this.appWindow.getAttribute("windowID")
					),
					1
				);
				windowHistory.unshift(this.appWindow.getAttribute("windowID"));
				this.appWindow.parentElement.childNodes.forEach((node, i) => {
					if (
						node instanceof Element &&
						node.classList.contains("app-window")
					) {
						node.style.zIndex = Math.abs(
							windowHistory.indexOf(
								node.getAttribute("windowID")
							) -
								(windowHistory.length - 1)
						);
					}
				});
			})();
			event.preventDefault();
			if (this.appWindow.hasAttribute("maximized")) {
				var prev =
					windowSizeHistory[this.appWindow.getAttribute("windowID")];
				this.appWindow.style.width = prev.width;
				this.appWindow.style.height = prev.height;
				this.appWindow.style.left = prev.left;
				this.appWindow.style.top = prev.top;
				setTimeout(
					() => this.appWindow.removeAttribute("maximized"),
					200
				);
			} else {
				this.appWindow.setAttribute("maximized", true);
				this.appWindow.style.left = 0;
				this.appWindow.style.top = document.querySelector("header").offsetHeight + "px";
				this.appWindow.style.width = window.innerWidth + "px";
				this.appWindow.style.height = window.innerHeight - document.querySelector("header").offsetHeight + "px";
			}
		});
	this.appWindow.addEventListener("pointerdown", (event) => {
		document
			.querySelectorAll(".app-window[active]")
			.forEach((appWindow) => appWindow.removeAttribute("active"));
		this.appWindow.setAttribute("active", true);
		windowHistory.splice(
			windowHistory.indexOf(this.appWindow.getAttribute("windowID")),
			1
		);
		windowHistory.unshift(this.appWindow.getAttribute("windowID"));
		this.appWindow.parentElement.childNodes.forEach((node, i) => {
			if (
				node instanceof Element &&
				node.classList.contains("app-window")
			) {
				node.style.zIndex = Math.abs(
					windowHistory.indexOf(node.getAttribute("windowID")) -
						(windowHistory.length - 1)
				);
			}
		});
		if (
			(!event.target.classList.contains("header") &&
				!event.target.parentElement.classList.contains("header")) ||
			event.target.classList.contains("window-controls")
		)
			return (onHeaderDown = false);
		onHeaderDown = true;
		event.preventDefault();
		var { offsetLeft, offsetTop } = this.appWindow,
			{ pageX, pageY } = event;
		mouseObservers[this.appWindow.getAttribute("windowID")] = (event) => {
			if (!mouseDown) {
				window.removeEventListener(
					"pointermove",
					mouseObservers[this.appWindow.getAttribute("windowID")]
				);
				return;
			}
			event.preventDefault();
			this.appWindow.style.left = `clamp(0px,${
				offsetLeft + event.pageX - pageX
			}px,${window.innerWidth - this.appWindow.offsetWidth}px)`;
			this.appWindow.style.top = `clamp(${document.querySelector("header").offsetHeight}px,${
				offsetTop + event.pageY - pageY
			}px,${window.innerHeight - this.appWindow.offsetHeight - document.querySelector("header").offsetHeight}px)`;
		};
		window.addEventListener(
			"pointermove",
			mouseObservers[this.appWindow.getAttribute("windowID")]
		);
		window.addEventListener(
			"pointerup",
			() =>
				window.removeEventListener(
					"pointermove",
					mouseObservers[this.appWindow.getAttribute("windowID")]
				),
			{ once: true }
		);
	});
	setTimeout(() => {
		this.appWindow.style.transform = "scale(1)";
		this.appWindow.focus();
		this.appWindow.setAttribute("active", true);
		this.appWindow.style.zIndex = windowHistory.length;
		windowHistory.unshift(this.appWindow.getAttribute("windowID"));
	}, 5);
}

let prevActive = null;
let windowHistory = [];
let windowSizeHistory = {};
let mouseDown = false;
let mouseObservers = {};
let onHeaderDown = false;

document.addEventListener("pointerdown", () => (mouseDown = true));
document.addEventListener("mousedown", () => (mouseDown = true));
document.addEventListener("pointerup", () => (mouseDown = false));
document.addEventListener("pointercancel", () => (mouseDown = false));
document.addEventListener("mouseleave", () => (mouseDown = false));
document.addEventListener("mouseup", () => (mouseDown = false));
document.addEventListener("blur", () => (mouseDown = false));

/**
 * @param {HTMLIFrameElement} iframe
 */
async function bubbleIframeMouseMove(iframe) {
	if (!iframe.contentWindow) {
		await (async () => {
			return new Promise((resolve) => {
				iframe.addEventListener("load", () => {
					resolve();
				});
			});
		})();
	}
	iframe.contentWindow.addEventListener("mousemove", function (e) {
		var evt = document.createEvent("MouseEvents");

		var boundingClientRect = iframe.getBoundingClientRect();

		evt.initMouseEvent(
			"mousemove",
			true,
			false,
			window,
			e.detail,
			e.screenX,
			e.screenY,
			e.clientX + boundingClientRect.left,
			e.clientY + boundingClientRect.top,
			e.ctrlKey,
			e.altKey,
			e.shiftKey,
			e.metaKey,
			e.button,
			null
		);

		if (onHeaderDown) {
			mouseObservers[
				iframe.parentElement.parentElement.getAttribute("windowID")
			](evt);
		}
	});
}

setInterval(() => {
	if (prevActive === null) prevActive = document.activeElement;
	if (
		document.activeElement.tagName.toUpperCase() === "IFRAME" &&
		document.activeElement !== prevActive
	) {
		mouseDown = false;
		var elm = document.activeElement.parentElement;
		while (
			!elm.classList.contains("app-window") &&
			elm !== document.body &&
			elm !== document.documentElement
		) {
			elm = elm.parentElement;
		}
		if (elm.classList.contains("app-window")) {
			document
				.querySelectorAll(".app-window[active]")
				.forEach((appWindow) => appWindow.removeAttribute("active"));
			elm.setAttribute("active", true);
			windowHistory.splice(
				windowHistory.indexOf(elm.getAttribute("windowID")),
				1
			);
			windowHistory.unshift(elm.getAttribute("windowID"));
			elm.parentElement.childNodes.forEach((node, i) => {
				if (
					node instanceof Element &&
					node.classList.contains("app-window")
				) {
					node.style.zIndex = Math.abs(
						windowHistory.indexOf(node.getAttribute("windowID")) -
							(windowHistory.length - 1)
					);
				}
			});
		}
	}
	prevActive = document.activeElement;
	document.querySelectorAll(".app-window").forEach((win) => {
		if (!win.hasAttribute("maximized"))
			windowSizeHistory[win.getAttribute("windowID")] = {
				width: win.style.width,
				height: win.style.height,
				top: win.style.top,
				left: win.style.left,
			};
	});
}, 1);

window.addEventListener("load", () => {
	var settings = JSON.parse(
		fs.readFileSync(__dirname + "/storage/settings.json")
	);
	if (settings.theme === "dark") {
		document.documentElement.style.setProperty("--header-color", "0,0,0");
		document.documentElement.style.setProperty(
			"--text-color",
			"255,255,255"
		);
	}
	window.onframemousemove = function (event) {
		var app;
		document.querySelectorAll("iframe").forEach((iframe) => {
			if (iframe.src.toString().match(event.app)) app = iframe;
		});
		if (!app) return;
		var boundingClientRect = app.getBoundingClientRect();
		event.clientX += boundingClientRect.left;
		event.clientY += boundingClientRect.top;
		Object.values(mouseObservers).forEach((observer) => observer(event));
	};
});

window.addEventListener("DOMContentLoaded", () => {
	document.documentElement.innerHTML = document.documentElement.innerHTML
		.split("{{time}}")
		.join(new Date().toLocaleTimeString());
	document
		.querySelectorAll(".app-window")
		.forEach((window) => new initAppWindow(window));
	document.querySelectorAll(".app-icon").forEach((appIcon) => {
		appIcon.addEventListener("click", () => {
			if (
				(elm = document.querySelector(
					"#" + appIcon.getAttribute("app")
				))
			) {
				setTimeout(() => {
					elm.style.transform = "scale(1)";
					elm.focus();
					elm.setAttribute("active", true);
					windowHistory.splice(
						windowHistory.indexOf(elm.getAttribute("windowID")),
						1
					);
					windowHistory.unshift(elm.getAttribute("windowID"));
					document
						.querySelector(".app-window")
						.parentElement.childNodes.forEach((node, i) => {
							if (
								node instanceof Element &&
								node.classList.contains("app-window")
							) {
								node.style.zIndex = Math.abs(
									windowHistory.indexOf(
										node.getAttribute("windowID")
									) -
										(windowHistory.length - 1)
								);
							}
						});
				}, 5);
				return;
			}
			const app = JSON.parse(
				fs
					.readFileSync(
						__dirname +
							"\\apps\\" +
							appIcon.getAttribute("app") +
							".json"
					)
					.toString()
			);
			var container = document.createElement("section");
			container.style.transform = "scale(0)";
			container.classList.add("app-window");
			container.id = appIcon.getAttribute("app");
			if (!!document.querySelector("[active]"))
				document.querySelector("[active]").removeAttribute("active");
			container.setAttribute("active", "");
			var overlay = document.createElement("div");
			overlay.classList.add("overlay");
			var header = document.createElement("div");
			header.classList.add("header");
			var title = document.createElement("h4");
			title.classList.add("title");
			title.textContent = app.title;
			header.appendChild(title);
			var main = document.createElement("div");
			main.classList.add("main");
			if (!!app.url) {
				main.append(
					(() => {
						var elm = document.createElement("iframe");
						elm.src = app.url;
						elm.style.position = "absolute";
						elm.style.top = "35px";
						elm.style.left = 0;
						elm.style.width = "100%";
						elm.style.height = "calc(100% - 35px)";
						elm.style.border = "none";
						elm.setAttribute("contenteditable", true);
						bubbleIframeMouseMove(elm);
						return elm;
					})()
				);
			} else {
				main.innerHTML = app.content;
			}
			if (app.title.toLowerCase() === "settings") {
				var settings = JSON.parse(
					fs.readFileSync(__dirname + "/storage/settings.json")
				);
				main.querySelector("form #" + settings.theme).setAttribute(
					"checked",
					true
				);
				main.querySelectorAll("form input").forEach((input) => {
					if (input.id === "light") {
						input.addEventListener("click", () => {
							document.documentElement.style.setProperty(
								"--header-color",
								"215,215,215"
							);
							document.documentElement.style.setProperty(
								"--text-color",
								"0,0,0"
							);
							var settings = JSON.parse(
								fs.readFileSync(
									__dirname + "/storage/settings.json"
								)
							);
							settings.theme = "light";
							fs.writeFileSync(
								__dirname + "/storage/settings.json",
								JSON.stringify(settings)
							);
						});
					} else if (input.id === "dark") {
						if (input.checked) {
							document.documentElement.style.setProperty(
								"--header-color",
								"0,0,0"
							);
							document.documentElement.style.setProperty(
								"--text-color",
								"255,255,255"
							);
						}
						input.addEventListener("click", () => {
							document.documentElement.style.setProperty(
								"--header-color",
								"0,0,0"
							);
							document.documentElement.style.setProperty(
								"--text-color",
								"255,255,255"
							);
							var settings = JSON.parse(
								fs.readFileSync(
									__dirname + "/storage/settings.json"
								)
							);
							settings.theme = "dark";
							fs.writeFileSync(
								__dirname + "/storage/settings.json",
								JSON.stringify(settings)
							);
						});
					}
				});
			}
			if (!!app.width) container.style.width = app.width;
			if (!!app.height) container.style.height = app.height;
			container.appendChild(overlay);
			container.appendChild(header);
			container.appendChild(main);
			document.body.appendChild(container);
			new initAppWindow(container);
		});
	});
});
