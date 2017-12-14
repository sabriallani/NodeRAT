import dispatcher from "../dispatcher";
import axios from "axios";

export default new class pcinfoAction{
    constructor(){
        Renderer.data.deviceInfo.Network.local.connected = navigator.onLine;

        this.getPublicIp();
        
        window.addEventListener("online", () =>{
            Renderer.data.deviceInfo.Network.local.connected = navigator.onLine;
            setTimeout(() => this.getPublicIp(), 1000); // name resolution error without this timeout
            this.updateData(Renderer.data.deviceInfo);
            console.log("Network Info-pcInfoAction > online");
        });

        window.addEventListener("offline", () =>{
            Renderer.data.deviceInfo.Network.local.connected = navigator.onLine;
            this.updateData(Renderer.data.deviceInfo);
            console.log("Network Info-pcInfoAction > offline");
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

