const { EventEmitter } = require("events");
const dispatcher = require("../dispatcher");
const Colors = require("colors");

class ServerStore extends EventEmitter {
    constructor() {
        super();
        this.vars = {};
    }

    get(variable, cb = null) {
        if (cb) {
            if(typeof cb == "function"){
                cb( this.vars[variable] && typeof this.vars[variable] != "function" ? this.vars[variable] : null );
            }
        } else {
            return this.vars[variable] && typeof this.vars[variable] != "function" ? this.vars[variable] : null;
        }
    }

    getType(variable, cb = null) {
        if (cb) {
            if (typeof cb == "function")
                cb(typeof this.vars[variable]);
        } else {
            return typeof this.vars[variable];
        }
    }

    getAll(cb = null) {
        if (cb) {
            if (typeof cb == "function")
                cb(this.vars);
        } else {
            return this.vars;
        }
        
    }

    update(variable, payload) {
        this.vars[variable] = payload;
        this.emit(`${variable}@UPDATED`, this.vars[variable]);
    }

    set(variable, payload) {
        this.vars[variable] = payload;
        this.emit(`${variable}@CREATED`, this.vars[variable]);
    }

    delete(variable) {
        if (typeof variable == "object") {
            if (variable.name && variable.key) {

                    delete this.vars[variable.name][variable.key];
                    this.emit(`${variable}@DELETED`);

            } else {
                throw new Error("Object needs an key and name so it can be deleted");
                return;
            }
        } else {
            if (this.vars[variable]) {
                delete this.vars[variable];
                this.emit(`${variable}@DELETED`);
            }
        }
    }

    push(variable, data) {
        if (variable instanceof Array && data instanceof Array) {

            if(data.length != variable.length){
                throw new Error("data length doesn't match their respective variables");
                return;
            }

            let i = 0;
            let variables = variable;
            let datas = data;

            variable = undefined;
            data = undefined;
            

            for (variable of variables) {
                data = datas[i];

                if (this.vars[variable]) {
                    if (this.vars[variable] instanceof Array) {

                        this.vars[variable].push(data);

                    } else {

                        if (data.key != undefined) {

                            let key = data.key;
                            let payload = data.payload;
                            this.vars[variable][key] = payload;

                        } else {

                            throw new Error("Object needs an key so Data can be assinged to it");
                            return;

                        }

                    }

                }
                
            }

            variable = undefined;
            data = undefined;

            for (variable of variables) {
                console.log(`ServerStore[push]: ${variable} was updated`.bgWhite.red);
                this.emit(`${variable}@UPDATED`, this.vars[variable]);
            }

        } else {
            
            if (this.vars[variable]) {
                if (this.vars[variable] instanceof Array) {
                    this.vars[variable].push(data);
                } else {
                    if (data.key != undefined) {
                        let key = data.key;
                        let payload = data.payload;
                        this.vars[variable][key] = payload;
                    } else {
                        throw new Error("Object needs an key so Data can be assinged to it");
                        return;
                    }
                }
                this.emit(`${variable}@UPDATED`, this.vars[variable]);
            }

        }
    }

    customEvent(eventName, msg) {
        this.emit(eventName, msg);
        console.log("event", eventName);
    }

    handleAction(action) {
        console.log("serverStore: event", action.type, action.payload[0] || "No Data");
        switch (action.type) {
            case "UPDATE":
                this.update(action.payload[0], action.payload[1]);
                break;

            case "DELETE":
                this.delete(action.payload);
                break;

            case "SET":
                this.set(action.payload[0], action.payload[1]);
                break;

            case "PUSH":
                this.push(action.payload[0], action.payload[1]);
                break;
        }
    }
}

let serverStore = new ServerStore;

dispatcher.register(serverStore.handleAction.bind(serverStore));

module.exports = serverStore;