import React from "react";
import pcinfoStore from "../../stores/pcinfoStore";
import pcinfoAction from "../../actions/pcinfoAction";
import formatBytes from "../../modules/formatbytes";
import {blue300, red300} from "material-ui/styles/colors";

export default class PcInfo extends React.Component{
    constructor(){
        super();
        this.state = {
            OS: pcinfoStore.getAll()
        };
    }


    SetInfo(){
        this.setState({
            OS: pcinfoStore.getAll()
        });
    }


    GetNetworkInfo(){
        let network = this.state.OS.Network,
        toReturn = {
            public : {
                ip : null,
                country : null,
                city : null,
                publicAPIdata : {}
            },
            local : {
                v4 : {
                    ip : null,
                    mac: null
                },
                v6 : {
                    ip: null,
                    mac: null
                },
                connected : false
            }
        };

        if(network != null){
            
            if(network.public != null)
                toReturn.public = network.public;

            toReturn.local.connected = network.local.connected;
            
           if(network.wifi){
               toReturn.local.v4.ip = network.wifi[0].address;
               toReturn.local.v4.mac = network.wifi[0].mac;
           } else if (network.eth0){
               // not connected to wifi
               if (network.eth0.length == 2) {

                   toReturn.local.v4.ip = network.eth0[1].address;
                   toReturn.local.v4.mac = network.eth0[1].mac;
                   toReturn.local.connected = true;

               } else if (network.eth0.length == 1) {

                   toReturn.local.v4.ip = network.eth0[0].address;
                   toReturn.local.v4.mac = network.eth0[0].mac;
                   toReturn.local.connected = true;

               }
           }
           if (toReturn.local.connected == false) {
               toReturn.public.ip = "No Internet";
               toReturn.public.country = "Earth";
           }
        }
        return toReturn;
    }

    componentDidMount(){
       pcinfoStore.on("change", this.SetInfo.bind(this));
    }

    render(){
        let network = this.GetNetworkInfo();
        let network_tooltip_mac = network.local.v4.mac ? network.local.v4.mac : network.local.v6.mac;
        return(
            <div className="details tbl">
               <div className="row">
                    <p className="tooltip tooltip-right" data-tooltip="Operating System">
                        <i className="fa fa-lg fa-desktop"></i> {this.state.OS.OS}
                    </p>
                    <p className="tooltip tooltip-right" data-tooltip="logged in User(Computer Name)">
                        <i className="fa fa-lg fa-user-circle"></i> {this.state.OS.User.username}({this.state.OS.User.computerName})
                    </p>
                    <p className="tooltip tooltip-right" data-tooltip="Random Access Memory">
                        <i className="fa fa-lg fa-microchip"></i> {this.state.OS.Memory.total} total
                    </p>
               </div>
               <div className="row">
                    <p className={network.local.connected ? "tooltip tooltip-right" : "tooltip tooltip-right error"} data-tooltip="Public IP Address">
                        <i className="fa fa-lg fa-globe"></i> {network.public.ip }
                   </p>
                   <p className={network.local.connected ? "tooltip tooltip-right" : "tooltip tooltip-right error"} data-tooltip={network.local.connected ? `mac: ${network_tooltip_mac}` : "Local IP Address"}>
                        <i className="fa fa-lg fa-podcast"></i> 
                        { network.local.connected ? 
                            <span>{ network.local.v4.ip ? network.local.v4.ip : network.local.v6.ip }</span>
                            :
                            "Not Connected"
                        }
                    </p>
                   <p className="tooltip tooltip-right" data-tooltip="Location">
                       <i className="fa fa-lg fa-flag"></i> {network.public.country}
                   </p>
               </div>
            </div>
        );
    }
}