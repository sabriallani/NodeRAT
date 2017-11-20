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
                    2: [{ text: "numm 2", icon: "start", action: this.testing2.bind(this) }],
                },
                selected: null,
                renderContext : false,
                clientX: 0,
                clientY: 0
            }
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
        alert("clicked!");
    }

    testing2(element){
        alert("2 clicked!");
    }


    render(){
        let currentOption = this.currentOption();
        return(
            <div className="body" onClick={this.removeContext.bind(this)}>

                {this.state.ContextMenu.renderContext ? 
                <ContextMenu 
                    pos={{ clientX: this.state.ContextMenu.clientX, clientY: this.state.ContextMenu.clientY }} 
                        srcElm={this.ContextElement} options={currentOption} /> : null}
               
                <VicBox
                    ContextHandler={(event) => this.handleContext(event, 1)}
                    Text="hello from world" Attributes={{}}/>

                <VicBox
                    
                    ContextHandler={(event) => this.handleContext(event, 2)}
                    Text="hello from world 2" Attributes={{}} />
            </div>
        )
    }
}