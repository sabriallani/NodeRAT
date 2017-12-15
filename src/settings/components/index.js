import React from "react";
import {Tabs, Tab} from "material-ui/Tabs";
import FontIcon from "material-ui/FontIcon";
import SwipeableViews from "react-swipeable-views";
import General from "./settings/general";
import Network from "./settings/network";
import Rat from "./settings/rat";

export default class Index extends React.Component{
    constructor(){
        super();
        this.state = {
            tabs : {
                slideIndex: 0
            }
        };

        this.styles = {
            slide : {
                padding: 10
            }
        }
    }


    handleTabSlide(value){
        this.setState({
            tabs : {
                slideIndex : value
            }
        });
    }

    render(){
        return(
            <div className="slider-parent">
                <Tabs onChange={this.handleTabSlide.bind(this)} value={this.state.tabs.slideIndex}>
                    <Tab label="General" icon={<FontIcon className="fa fa-cogs"/>} value={0} />
                    <Tab label="Network" icon={<FontIcon className="fa fa-rss" />} value={1} />
                    {/* <Tab label="Server" icon={<FontIcon className="fa fa-server" />} value={2} /> */}
                </Tabs>
                <SwipeableViews index={this.state.tabs.slideIndex} onChangeIndex={this.handleTabSlide.bind(this)}>
                    <div style={this.styles.slide}>
                        <General />
                    </div>
                    <div style={this.styles.slide}>
                        <Network />
                    </div>
                    {/* <div style={this.styles.slide}>
                        <Rat />
                    </div> */}
                </SwipeableViews>
            </div>
        );
    }
}