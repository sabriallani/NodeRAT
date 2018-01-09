
const setShowVictims = (e, toggled) => {
    return new Promise((resolve, reject) => {

        ipcRenderer.once("invokedEvent:setConfigSettings@response", resolve);

        ipcRenderer.send("Stores", {
            store: "CoreStore",
            type: "once",
            eventName: "setConfigSettings"
        });

        ipcRenderer.send("Stores:method", {
            store: "CoreStore",
            type : "once",
            method: "customEvent",
            methodParams: ["setConfigSettings", { name: "hideOfflineSlaves", value: toggled }]
        });

    });
}

const getShowVictim = () => {
    return new Promise((resolve, reject) => {
        ipcRenderer.once("invokedServerStoreConstant:*-#ServerConstants", (e, res) => {
            if (res != undefined || res != "undefined")
                resolve(res, e);
            else
                reject(e, res);
        });

        ipcRenderer.send("Stores:Server:Constants", {
            name: "*",
            id: "ServerConstants"
        });

    });
}

module.exports = { setShowVictims, getShowVictim }


