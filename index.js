const { app, BrowserWindow, ipcMain, Tray, Menu, dialog} = require('electron');
const ipcModule = require("./src/modules/ipcListeners");
const path = require('path');
const url = require('url');
const autoLaunch = require("auto-launch");
const CoreAction = require("./src/actions/nodeCoreAction");
const CoreStore = require("./src/stores/nodeCoreStore");
const Server = require("./server/index");
const Settings = require("./server/settings");


let nodeRat = null,
    startTime = new Date,
    endTime = 0;
    startTime = startTime.getTime();

class NodeRAT{
    constructor(){
        this.Windows = {};
        this.src = {
            icon: {
                256: "./src/static/images/rat-face-256.ico",
                64: "./src/static/images/rat-face-64.ico",
                32: "./src/static/images/rat-face-32.ico",
                red: {
                    64: "./src/static/images/rat-face-red-64.ico",
                    32: "./src/static/images/rat-face-red-32.ico"
                }
            },
            png: {
                full: "./src/static/images/icon.png",
                64: "./src/static/images/icon-64.png",
                32: "./src/static/images/icon-32.png"
            },
            svg: {
                rat: "./src/static/images/poly-rat-face.svg",
                ratRed: "./src/static/images/poly-rat-face-red.svg",
                icon: "./src/static/images/icon.svg",
            }
        }
        this._ipcModule = null;
        this.settings = null;
        if(process.platform != "linux")
            this.createTray();
        this.createLoaderWindow();

        Settings.autoSave(true);
        Settings.onLoad((c) =>{ 
            this.settings = c;
            this.con();
        });
    }

    con(){
        let port = this.settings["network.port.tcp.use"];
        this.SetStoreVars();
        Server.start({CoreAction, CoreStore, port});
        Server.listenForPortUpdate();
        this.createMainWindow();
        this.startEventListeners();
    }

    startEventListeners(){
        CoreStore.on("RestartApplication", () => {
            this.appRestart();
        });

        CoreStore.on("setConfigSettings", (arg) => {
            Settings.onLoad(() => {
                    console.log("set", arg);
                    if (typeof arg != "object") {
                        throw new Error("setConfig argument must be object type at index");
                        return;
                    } else if (typeof arg == "object" && arg.hasOwnProperty("name") == false || arg.hasOwnProperty("value") == false) {
                        throw new Error("arguments for setConfig must have arg.name and arg.value");
                    }

                    let [stat, res] = Server.setConfig(arg.name, arg.value);
                    CoreStore.customEvent("setConfigSettings@response", [stat, res]);
                CoreStore.customEvent("ApplicationNeedsRestart", "Server Settings updated");
                });
            Settings.reload();
            });
    }

    createLoaderWindow(){
        this.Windows.loaderWin = new BrowserWindow({
            width: 500,
            height: 300,
            parent: this.Windows.mainWindow || null,
            resizable: false,
            movable: false,
            maximizable: false,
            minimizable: false,
            fullscreenable: false,
            skipTaskbar: true,
            frame: false,
            modal: true,
            show: false,
            backgroundColor: "#222222"
        });

        this.Windows.loaderWin.loadURL(url.format({
            pathname: path.join(__dirname, 'views/loader.html'),
            protocol: 'file:',
            slashes: true
        }));

        this.Windows.loaderWin.on("ready-to-show", () => {
            this.Windows.loaderWin.show();
        });
    }

    createMainWindow(){
        this.Windows.mainWindow = new BrowserWindow({
            minHeight: 699,
            minWidth: 1152,
            width: 1153,
            height: 700,
            title: "NodeRAT",
            center: true,
            fullscreenable: true,
            icon: this.src.png.full,
            backgroundColor: "#222222",
            show: false
        });


        this.Windows.mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'views/index.html'),
            protocol: 'file:',
            slashes: true
        }));

        // Open the DevTools.
        this.Windows.mainWindow.webContents.openDevTools();

        this.Windows.mainWindow.on("ready-to-show", () => {
            this.timeout = setTimeout(() => {
                this.Windows.loaderWin.close();
                this.Windows.mainWindow.show();

                clearTimeout(this.timeout);
                this.timeout = null
                this.Windows.loaderWin = null;
                this.setMenuItems();
            }, 2000);
        });
        this.StartIpc()
    }

    settingsWindow(menuitem, window, event) {
        this.Windows.settings = new BrowserWindow({
            parent: this.Windows.mainWindow,
            title: "Settings",
            modal: true,
            skipTaskbar: true,
            icon: this.src.icon["64"],
            width: 700,
            height: 900,
            center: true,
            resizable: false,
            maximizable: false,
            minimizable: false,
            fullscreenable: false,
            backgroundColor: "#222222",
            show: false
        });
        this.Windows.settings.loadURL(url.format({
            pathname: path.join(__dirname, 'views/settings.html'),
            protocol: 'file:',
            slashes: true
        }));
        this.Windows.settings.setMenu(null);
        this.Windows.settings.on("ready-to-show", this.Windows.settings.show);
        this.Windows.settings.on("close", e => this.Windows.settings = null);
        this.Windows.settings.webContents.openDevTools();
    }

    createTray(){
        this.tray = new Tray(this.src.png["64"]);
        this.tray.setToolTip("NodeRAT");
        this.tray.on("click", (e) => {
            if(this.Windows.mainWindow){
                if (this.Windows.mainWindow.isMinimized())
                    this.Windows.mainWindow.restore();
                if(!this.Windows.mainWindow.isVisible())
                    this.Windows.mainWindow.show();
                if(!this.Windows.mainWindow.isFocused())
                    this.Windows.mainWindow.focus();
            }

        });
    }

    setMenuItems(){

        let template = [
                {label : "Config",
                    submenu: [
                        {
                            label : "Settings",
                            click: this.settingsWindow.bind(this),
                            accelerator : "Ctrl+s"
                        },
                        {
                            label : "Refresh",
                            click : this.windowReload.bind(this),
                            accelerator : "Ctrl+r"
                        },
                        {
                            label : "Restart",
                            click : this.appRestart.bind(this),
                            accelerator : "Ctrl+Shift+r"
                        },
                        {
                            label : "Always on top",
                            click : this.setOnTop.bind(this),
                            type  : "checkbox",
                            checked : false
                        },
                        {
                            label : "Exit",
                            role  : "quit",
                            accelerator: "Ctrl+Esc"
                        }
                    ]}
            ];
            let menu = Menu.buildFromTemplate(template);
            Menu.setApplicationMenu(menu);
    }

    SetStoreVars(){
        let tcpPortDefault = this.settings["network.port.tcp.default"],
            tcpPortUse     = this.settings["network.port.tcp.use"],
            port = tcpPortDefault == tcpPortUse ? tcpPortDefault : tcpPortUse; // check if port has changed or not;
        CoreAction.setVar("appStartup", null);
        CoreAction.setVar("RATMainTCPPort", port);
    }

    windowReload(menuitem, window, event){
        let option = {
            type: "question",
            buttons: ["Cancel", "Refresh"],
            title: "Confirm",
            message: "Refresh Application ?",
            cancelId: 1
        };

        dialog.showMessageBox(null, option, (response) =>{
            if(response == 1)
                this.Windows.mainWindow.reload();
            });
    }

    StartIpc(){
        let {ServerStore, ServerAction, ServerConstants} = Server.export({
            Constants : "ServerConstants",
            Action    : "ServerAction",
            Store     : "ServerStore"
        });
       this._ipcModule = new ipcModule({ServerStore, ServerAction, ServerConstants}, CoreStore, CoreAction, this.Windows.mainWindow);
    }

    setOnTop(menuItem, browserWindow, event){
        this.Windows.mainWindow.setAlwaysOnTop(menuItem.checked);
    }

    appRestart(){
        Server.stop();
        app.relaunch();
        app.quit();
    }

    appWillQuit(e){
        Server.stop();
        this.tray.destroy();
    }

    appQuit(e){
        this.tray.destroy();
    }

}


app.on('ready', () => {
    endTime = new Date;
    endTime = endTime.getTime();
    console.log("app ready\nTime:", (endTime - startTime) / 1000 , "seconds");
    if(nodeRat === null)
        nodeRat = new NodeRAT();
});

try {
    app.on("will-quit", (e) =>{
        nodeRat.appWillQuit(e);
    });
    
    app.on("quit", (e) =>{
        nodeRat.appQuit(e);
    });
} catch (error) {
    console.log("error:", error);
}



//TODO : add before close action to stop the server and do some clean up