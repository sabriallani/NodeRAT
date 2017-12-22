import React from "react";

export default class vicBox extends React.Component{
    constructor(props){
        super(props);

        this.state = props;
    }

    setAttributes(){
        let attr = {};

        if (!this.state.Attributes.className || this.state.Attributes.className == undefined)
            this.state.Attributes.className = [];

        for (let attrName in this.state.Attributes){
            let attrValue = this.state.Attributes[attrName];

            if(this.state.Attributes.data){
                for (let dataName in this.state.Attributes.data){
                    let dataValue = this.state.Attributes.data[dataName];
                    let temp_name = `data-${dataName}`;
                    attr[temp_name] = dataValue;
                }
            }


            if (this.state.Attributes.className.includes("content") === false){
                this.state.Attributes.className.push("content");
                if (typeof this.state.Attributes.className != "string"){
                    let tmpClassName = "";
                    this.state.Attributes.className.map((name) => tmpClassName += `${name} `);
                    this.state.Attributes.className = tmpClassName;
                }
            }

            attr[attrName] = attrValue;
        }


        delete attr.data;
        return attr;
    }

    render(){
        return(
            <div className="vic-box z-depth-5" onContextMenu={this.state.ContextHandler || null}>
                <div {...this.setAttributes()}>
                    {this.state.Text + ` - status: ${this.props.info.status}` || ""}
                </div>
                <img src="http://lorempixel.com/60/60/" className="screen-preview" />
            </div >
        );
    }
}