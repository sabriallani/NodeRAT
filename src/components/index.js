import React from "react";
import DarkBaseTheme from "material-ui/styles/baseThemes/darkBaseTheme";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from "material-ui/styles/getMuiTheme";
import Header from "./header";
import Body from "./body";

export default class Index extends React.Component{

    render(){
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(DarkBaseTheme)}>
                <div>
                    <Header />
                    <Body />
                </div>
            </MuiThemeProvider>
        )
    }
}