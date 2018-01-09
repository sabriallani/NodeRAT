const {ipcMain} = require("electron");
const Color = require("colors");


module.exports =  class ipc{
    constructor(dependencies = {}, autostart = true){

        this.EVENTS = {
            names: [], //contains all event names
            event: {
                // "eventname": {
                //     "count": 0,
                //     "type": "on" || "once"
                // }
            }
        }

        this.STORES = dependencies.hasOwnProperty("stores") ? dependencies.stores : {};
        this.ACTIONS = dependencies.hasOwnProperty("actions") ? dependencies.actions : {};
        this.WINDOWS = dependencies.hasOwnProperty("windows") ? dependencies.windows : {};

        if(autostart)
            this.startAll();
    }

    startAll(){
        this.store();
        this.action();
        console.log( 
            `List of Stores and Actions in IPC:`.bgBlue.black,"\n",
            `\tStores:`.bgBlack.yellow,"\n",
            `\t\t${JSON.stringify(this.STORES)}`.bgBlack.white,"\n",
            `--------------------------------------\n`,
            `\tActions:`.bgBlack.yellow, "\n",
            `\t\t${JSON.stringify(this.ACTIONS)}`.bgBlack.white,"\n",
        );
    }

    store(){
        /*
            ;the stores will fire `invokedEvent:${eventName}`

            ipcRenderer.on( eventName , (e, res) => {
                 ;event happened do yo thang
            });

            ; set listener for the event
            ipcRenderer.send("Stores", {
                store : "CoreStore",
                type : "on" || "once",
                eventName : "", // on && once = String: "event name"
            });

        */
        
        this._store();

        this._store_method();
        
        this._store_server_constants();
    }

    _store(){
        ipcMain.on("Stores", (event, params) => {

            let { store, type, eventName } = params;

            type = type ? type : "once";

            if (store in this.STORES === false) {
                let string = `${store} does not exists\nlist of avaiable Stores:\n`;
                for (let name in this.STORES)
                    string += "\t" + this.STORES[name] + "\n";

                throw new ReferenceError(string);
                return;
            }

            console.log(`IPC-Store[got]: ${store} - ${type} - ${eventName}`.bgBlack.yellow, "\n");

            if (this.EVENTS.names.indexOf(eventName) != -1 && this.EVENTS.event[eventName].type == type) {
                /*
                    check if the event name is in the list and it's the same type and if it have been called,
                    if so then add a new listener.
                    else don't added a new listener on same event in store cause there a one and it haven't been called yet.
                */

                this.STORES[store][type](eventName, (res) => {
                    console.log(`IPC-Store [invoke]: ${eventName}`);
                    event.sender.send(`invokedEvent:${eventName}`, res);
                    this.EVENTS.event[eventName].count++;
                    this.EVENTS.names.pop(eventName);
                });

            } else {

                this.EVENTS.names.push(eventName);

                if (this.EVENTS.event.hasOwnProperty(eventName) == false || this.EVENTS.event[eventName].type != type) {
                    this.EVENTS.event[eventName] = {
                        "count": 0,
                        "type": type
                    }
                }

                this.STORES[store][type](eventName, (res) => {
                    event.sender.send(`invokedEvent:${eventName}`, res);
                    console.log(`IPC-Store [invoke]: ${eventName}`);
                });

            }

            console.log(`IPC-Store[EVENTS]: ${JSON.stringify(this.EVENTS)}\n`.bgWhite.blue);

        });
    }

    _store_method(){

        ipcMain.on("Stores:method", (event, params) => {

            let { store, method, methodParams, id } = params;

            if (store in this.STORES === false) {
                let string = `${store} does not exists\nlist of avaiable Stores:\n`;
                for (let name in this.STORES)
                    string += "\t" + this.STORES[name] + "\n";

                throw new ReferenceError(string);
                return;
            }

            if (Array.isArray(methodParams) == false) {
                throw new TypeError(`Stores:method : method parameters is not type of array, please supply an array as array type\n
                                    \t store: ${store}\n
                                    \t method: ${method}\n
                                    \t params: ${methodParams}`);
                return;
            }

            id = id == undefined || id == null || id == "" ? null : id;

            console.log(`IPC-Store:method [got]: ${store} - ${method} - ${methodParams} - #${id} \n`.bgBlack.yellow);

            this.STORES[store][method](...methodParams, (res) => {
                let channel = `invokedStoreMethod:${store}-${method}` + (id == null ? "" : `-#${id}`);
                console.log(`IPC-StoreMethod [invoke]: ${store}-${method}-#${id}\n\t channel : ${channel}`);
                event.sender.send(channel, res);
            });

        });
    }

    _store_server_constants(){
        
        ipcMain.on("Stores:Server:Constants", (event, params) => {


            let { name, id } = params;

            let store = "ServerStore",
                method = "get",
                methodParams = [ "Constants" ];

            // param: name = name of the constant in ServerStore.vars.constants;

            if (store in this.STORES === false) {
                let string = `${store} does not exists\nlist of avaiable Stores:\n`;
                for (let name in this.STORES)
                    string += "\t" + this.STORES[name] + "\n";

                throw new ReferenceError(string);
                return;
            }

            if (Array.isArray(methodParams) == false) {
                throw new TypeError(`Stores:Server:Constants : method parameters is not type of array, please supply an array as array type\n
                                    \t store: ${store}\n
                                    \t method: ${method}\n
                                    \t params: ${methodParams},
                                    \t Constant: ${name}`);
                return;
            }

            id = id == undefined || id == null || id == "" ? null : id;

            console.log(`IPC-Store:Server:Constants [got]: ${name} - #${id} \n`.bgBlack.yellow);

            this.STORES[store][method](methodParams[0] , (res) => {

                if(name != "*") // use * to get every object in server constants
                    res = res[name];

                let channel = `invokedServerStoreConstant:${name}` + (id == null ? "" : `-#${id}`);
                console.log(`IPC-Store:Server:Constants [invoked]: ${channel}\n\t Data: ${JSON.stringify(res)}`);
                event.sender.send(channel, res);

            });

        });
    }

    action(){
        ipcMain.on("Actions", (event, params) => {

            let { action, method, methodParams} = params;

            if (action in this.ACTIONS === false) {
                let string = `${action} does not exists\nlist of avaiable Actions:\n`;
                for (let name in this.ACTIONS)
                    string += "\t" + this.ACTIONS[name] + "\n";

                throw new ReferenceError(string);
                return;
            }

            if(Array.isArray(methodParams) == false){
                throw new TypeError(`Action: method parameters is not type of array, please supply an array as array type\n
                                    \t action: ${action}\n
                                    \t method: ${method}\n
                                    \t params: ${methodParams}`);
                return;
            }

            this.ACTIONS[action][method](...methodParams);

        });
    }


}