const {ipcMain} = require("electron");

module.exports =  class ipcListeners{
    constructor(dependencies, CoreStore, CoreAction){
        this.depend = dependencies;
        this.getAppConfig(CoreStore, CoreAction);
    }

    getAppConfig(coreStore, coreAction){
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
            coreStore.on(actionName, () =>{
                let name = actionName.split("@")[0];
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
    }
}