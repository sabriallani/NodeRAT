const {ipcMain} = require("electron");


module.exports =  class ipcListeners{
    constructor(dependencies, CoreStore, CoreAction){
        this.depend = dependencies;
        this.envVar = {};
        this.getAppConfig(CoreStore, CoreAction, dependencies);
    }

    getAppConfig(coreStore, coreAction, dependencies){
        const ServerStore = dependencies.ServerStore;
        const ServerAction = dependencies.ServerAction;
        const ServerConstants = dependencies.ServerConstants;
        this.envVar.ServerConstants = ServerConstants;

        ipcMain.on("getEnvVars", (event, name) => {
            if (name && this.envVar[name] != undefined) {
                event.sender.send("envVarResponse", this.envVar[name]);
            } else {
                event.sender.send("envVarResponse", this.envVar);
            }
        });


        // @arg => {method : string , args : array}
        // @id => so on core-store-return not all listeners listen
        ipcMain.on("core-store-l", (event, method, arg = [], id = null) => {
            if (typeof coreStore[method] == "function"){

                if(id){
                    event.sender.send(`core-store-r#${id}`, coreStore[method](...arg) );
                }else{
                    event.sender.send("core-store-r", coreStore[method](...arg) );
                }

            } else{

                if (id) {
                    event.sender.send(`core-store-r#${id}`, "unknown_method");
                } else {
                    event.sender.send("core-store-r", "unknown_method");
                }

            }
        });

        // @actionName => event name to listen to: string
        ipcMain.on("core-store-on", (event, actionName) => {
            console.log("core-store-on: listen", actionName);
            coreStore.on(actionName, () =>{
                let name = actionName.split("@")[0];
                console.log("core-store-on: fire", actionName, name);
                event.sender.send(`core-store-on-${actionName}`, coreStore.getVar(name));
            });
        });

        // @arg => {method : string , args : array}
        // @id => so on core-action-return not all listeners listen
        ipcMain.on("core-action-l", (event, method, arg = [], id = null) => {
            if (typeof coreStore[method] == "function"){

                if (id) {
                    event.sender.send(`core-action-r#${id}`, coreAction[method](...arg));
                } else {
                    event.sender.send(`core-action-r`, coreAction[method](...arg));
                }

            }else{
                if (id) {
                    event.sender.send(`core-action-r#${id}`, "unknown_method");
                } else {
                    event.sender.send(`core-action-r`, "unknown_method");
                }
            }
        });


        ipcMain.on("ServerStore", (event, method, arg = [], id = null) => {
            let responseChannel = `ServerStoreResponse@${method}`;
            if (id) {
                if(typeof id == "string"){
                   responseChannel = `ServerStore#${id}`;
                }else if(typeof id == "object" && id.full == true){
                    responseChannel = id.id;
                }
            }
            if (typeof ServerStore[method] == "function") {

                
                let response = ServerStore[method](...arg);
                
                console.log("ServerStore:", responseChannel);
                event.sender.send(responseChannel, response);

            } else {
                event.sender.send(responseChannel, "unknown_method");
            }
        });


        ipcMain.on("ServerStore-on", (event, name, id = null) => {
            let responseChannel = `ServerStoreResponse-on@${name}`;
            if (id) {
                if(typeof id == "string"){
                   responseChannel = `ServerStore-on#${id}`;
                }else if(typeof id == "object" && id.full == true){
                    responseChannel = id.id;
                }
            }
            
            if(typeof name == "object"){
                if (name.variable && name.status) {
                    name = `${name.variable}@${name.status}`;
                } else {
                    throw new Error("ipc - ServerStore-on: param 'name' is objected but either name.variable or name.status is not set");
                    return;
                }
            }
            ServerStore.on(name, (response) => {
                event.sender.send(responseChannel, response);
            });
        });

        ipcMain.on("ServerAction", (event, method, arg = [], id = null) => {
            let responseChannel = `ServerActionResponse@${method}`;
            if (id) {
                if(typeof id == "string"){
                   responseChannel = `ServerAction#${id}`;
                }else if(typeof id == "object" && id.full == true){
                    responseChannel = id.id;
                }
            }
            if (typeof ServerAction[method] == "function") {

                let response = ServerAction[method](...arg);

                event.sender.send(responseChannel, response);

            } else {
                event.sender.send(responseChannel, "unknown_method");
            }
        });


    }
}