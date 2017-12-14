const net = require("net");
const { EventEmitter } = require("events");
const crypto = require("crypto");
const Settings = require("./settings");

function md5(str) {
    let hash = crypto.createHash("md5");
    hash.update(str);
    return hash.digest("hex");
}

class Server extends EventEmitter{
    constructor(){
        super();
        this.connectedGuests = {};
        Settings.autoSave(true)
        this.port = null;
        this.CoreAction = null;
        this.CoreStore = null;
    }

    start({ CoreAction = null, CoreStore = null , port = 1528}){
        if (CoreAction != null || CoreStore != null || port != null) {
            this.port = port;
            this.CoreAction = CoreAction;
            this.CoreStore = CoreStore;
        } else {
            throw new Error("Dependcies are missing on Server");
        }

        console.log(`server started on port ${this.port}`);
        this.server = net.createServer((conn) => {

            let ip = conn.remoteAddress;

            this.connectedGuests[ip] = {
                conn,
                status: 1
            };

            console.log(ip, "connected");
            conn.on("end", () => {
                if (this.connectedGuests[ip])
                    this.connectedGuests[ip].status = 0;
                console.warn(ip, "disconnected");
            });

            conn.on("data", (data) => {
                console.log("\n","DATA >", data.toString(), "\n");
                if (data.toString() == "whois")
                    conn.write(md5("noderatistheboss"));
            });
        });
        this.server.listen(this.port, "0.0.0.0");
    }

    listenForPortUpdate(){
        if(this.CoreAction != null || this.CoreStore  != null){
            this.CoreStore.on("RATMainTCPPort@UPDATED", (port) => {
                console.log("port changed", port);
                this._changePort(port);
            });
        }else{
            throw new Error("Could Not Listen for tcp port change");
        }
    }

    _changePort(port){
       Settings.set({
            obj : "network.port.tcp.use",
            value : port
        });
        this.CoreStore.customEvent("ApplicationNeedsRestart", "Server Port Updated");

    }
}

module.exports = new Server;