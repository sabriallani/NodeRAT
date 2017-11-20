import React from "react";
import ReactDOM from "react-dom";
import DarkBaseTheme from "material-ui/styles/baseThemes/darkBaseTheme";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from "material-ui/styles/getMuiTheme";
import Index from "./components/index";


ReactDOM.render(
    <MuiThemeProvider muiTheme={getMuiTheme(DarkBaseTheme)}>
        <Index />
    </MuiThemeProvider>, 
    document.getElementById("app")
);
