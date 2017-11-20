const { EventEmitter } =  require("events");
const dispatcher =  require("../dispatcher");

class PcInfoStore extends EventEmitter{
    constructor(){
        super();
        let data = window.Renderer.data.deviceInfo;
        this.state = {
            OS: {
                OS: data.OS,
                FullNameVersion: data.FullNameVersion,
                Version: data.Version,
                User: {
                    username: data.User.username,
                    computerName: data.User.computerName,
                },
                Network: data.Network,
                Memory: data.Memory
            }
        };
    }

    getAll(){
        return this.state.OS;
    }

    update(payload){
        this.state.OS = payload;
        this.emit("change");
    }

    publicIPUpdate(payload, error = false){
        if(error){
            this.emit("PUBLIC_IP_UPDATE_ERROR");
            return;
        }
        this.state.OS.Network.public = {
            city: payload.city,
            country: payload.country,
            ip: payload.ip,
            publicAPIdata : payload,
            error
        }
        this.emit("change");
        this.emit("PUBLIC_IP_UPDATED", payload);
    }


    handleAction(action){
        switch(action.type){
            case "PCINFO_UPDATE":
                this.update(action.payload);
            break;

            case "PCINFO_PUBLIC_IP_UPDATE":
                this.publicIPUpdate(action.payload);
            break;

            case "PCINFO_PUBLIC_IP_UPDATE_ERROR":
                this.publicIPUpdate(action.payload, true);
            break;
        }
    }
}

let pcinfoStore = new PcInfoStore;

dispatcher.register(pcinfoStore.handleAction.bind(pcinfoStore));

module.exports = pcinfoStore;