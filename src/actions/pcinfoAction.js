import dispatcher from "../dispatcher";
import axios from "axios";

export default new class pcinfoAction{
    constructor(){
        Renderer.data.deviceInfo.Network.local.connected = navigator.onLine;

        this.getPublicIp();
        
        window.addEventListener("online", () =>{
            Renderer.data.deviceInfo.Network.local.connected = navigator.onLine;
            this.getPublicIp();
            this.updateData(Renderer.data.deviceInfo);
        });

        window.addEventListener("offline", () =>{
            Renderer.data.deviceInfo.Network.local.connected = navigator.onLine;
            this.updateData(Renderer.data.deviceInfo);
        });

    }

    updateData(data){
        dispatcher.dispatch({
            type : 'PCINFO_UPDATE',
            payload: data
        });
    }

    getPublicIp(){
        axios.get("http://ipinfo.io/json")
        .then((res) =>{
            dispatcher.dispatch({
                type: "PCINFO_PUBLIC_IP_UPDATE",
                payload: res.data
            });
        })
        .catch((res) =>{
            dispatcher.dispatch({
                type: "PCINFO_PUBLIC_IP_UPDATE_ERROR",
                payload: res.data
            });
        });
    }

    
}

