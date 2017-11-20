import React from "react";

export default class ContextMenu extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            options: props.options,
            pos : props.pos
        };
        this.srcElm = props.srcElm;
    }

    handleAction(action, e){
        if(action && typeof action != undefined)
            action(this.srcElm);
    }

    getOptions(){
        let o = [];
        let left = 100,
            top = 100;

        if (this.state.pos.clientX && this.state.pos.clientY) {
            left = this.state.pos.clientX;
            top = this.state.pos.clientY;
        }
        this.state.options.map((optionObj, i) =>{


            if (!optionObj.icon)
                optionObj.icon = null;

            if (optionObj.text)
                o.push(
                    <span className="option icon" key={Date.now() + (i * i / 3)} onClick={this.handleAction.bind(this, optionObj.action)}>
                        <span className={optionObj.icon ? `fa fa-${optionObj.icon}` : 'fa'} key={Date.now() + (i * i * 3 / 2) }></span>
                        {optionObj.text}
                    </span>
                );
        });

        return o;
    }

    render(){
        return(
            <div className="box" key={Date.now() + this.state.pos.clientX} style={{ left: this.props.pos.clientX, top: this.props.pos.clientY }}>
                {this.getOptions()}
            </div>
        )
    }
}