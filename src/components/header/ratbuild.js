import React from "react";

export default class RatBuild extends React.Component{
    constructor(){
        super();
    }

    render(){
        let Process = window.Renderer.data.process;
        return(
            <div className="details tbl">
                <div className="row">

                    <p className="tooltip tooltip-right" data-tooltip="Process ID">
                        <i className="fa fa-lg fa-hashtag"></i> {Process.pid}
                    </p>

                    <p className="tooltip tooltip-right" data-tooltip="Node Version">
                        <i className="fa fa-lg fa-superpowers"></i> {Process.versions.node}
                    </p>

                    <p className="tooltip tooltip-right" data-tooltip="Electron Version">
                        <i className="fa fa-lg fa-window-maximize"></i> {Process.versions.electron}
                    </p>

                </div>

                <div className="row" >
                    <p className="tooltip tooltip-left" data-tooltip="Chromium Version">
                        <i className="fa fa-lg fa-chrome"></i> 
                        {(Process.versions.chrome.toString().split(".").map((val, i, arr) => `${arr[0]}.${arr[1]}`)[0])}
                    </p>

                    <p className="tooltip tooltip-left" data-tooltip="V8 Version">
                        <i className="fa fa-lg fa-viacoin"></i> 
                        { (Process.versions.v8.toString().split(".").map((val, i, arr) => `${arr[0]}.${arr[1]}`)[0]) }
                    </p>

                    <p className="tooltip tooltip-left" data-tooltip="atom shell Version">
                        <i className="fa fa-lg fa-terminal"></i> {Process.versions["atom-shell"]}
                    </p>
                </div>
            </div>
        );
    }
}