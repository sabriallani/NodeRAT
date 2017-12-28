import React from "react";

export default class vicBox extends React.Component{
    constructor(props){
        super(props);

        this.state = props;
        console.log("state", this.state);
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
        let r = () => {
            if (true) {
                return <div>
                    <div {...this.setAttributes() }>
                        <div className="info">
                            <div className="col name">
                                {this.state.Text}
                            </div>
                            <div className="col">

                                <div>
                                    <i className="fa fa-hdd-o"></i>
                                    <span>{this.state.info.data.os.hdd.used}/{this.state.info.data.os.hdd.total} {this.state.info.data.os.hdd.unit}</span>
                                </div>

                                <div>
                                    <i className="fa fa-microchip"></i>
                                    <span>{this.state.info.data.os.memory.used}/{this.state.info.data.os.memory.total} {this.state.info.data.os.memory.unit}</span>
                                </div>

                            </div>

                            <div className="col">
                                <div>
                                    <i className="fa fa-podcast"></i>
                                    <span>{this.state.info.data.os.localIPAddress} <br /> {this.state.info.realIP}</span>
                                </div>

                                <div>
                                    <i className="fa fa-tasks"></i>
                                    <span>{this.state.info.data.os.processor}</span>
                                </div>
                            </div>

                            <div className="col">

                                <div>
                                    <i className="fa fa-desktop"></i>
                                    <span>{this.state.info.data.os.name}</span>
                                </div>

                                <div>
                                    <i className="fa fa-user"></i>
                                    <span>{this.state.info.data.os.username}</span>
                                </div>

                            </div>

                        </div>
                    </div>
                    <span className={this.props.info.status == 1 ? "status online" : "status offline"}></span>
                    <img src="http://lorempixel.com/60/60/" className="screen-preview" />
                </div>
            } else {
                return <div>Someone is connecting</div>
            }
        }
        return(
            <div className="vic-box z-depth-5" onContextMenu={this.state.ContextHandler || null}>
                {r()}
            </div >
        );
    }
}