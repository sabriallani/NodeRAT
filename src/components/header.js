import React from "react";
import PcInfo from "./header/pcinfo";
import RatBuild from "./header/ratbuild";
import LinearProgress from "material-ui/LinearProgress";
import MenuItem from 'material-ui/MenuItem';
import IconMenu from 'material-ui/IconMenu';
import SettingsIcon from "material-ui/svg-icons/action/settings";
import IconButton from 'material-ui/IconButton';
import { green100, green200 } from "material-ui/styles/colors";


export default class Header extends React.Component{
    render(){
        return (
            <div className="z-depth-4 header"> 
                <PcInfo />
                <div className="details logo"></div>
                <RatBuild />
            </div>
         );
    }
}



