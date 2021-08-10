const {app, BrowserWindow} = require("electron");



app.whenReady().then(() => {
    const window = new BrowserWindow({
        fullscreen: true,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            preload: __dirname + "/main.js"
        }
    });

    exports.window = window;

    window.show();
    window.loadFile(__dirname + "/src/index.html");
});

app.on("window-all-closed", () => process.exit());