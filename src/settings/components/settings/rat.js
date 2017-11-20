import React from "react";
import { Divider, Toggle, Paper, Chip, IconButton, Dialog, RaisedButton } from "material-ui";
import { blueGrey100, deepOrange200, red500, grey800, deepOrange300, green50 } from "material-ui/styles/colors";


export default class Network extends React.Component {
    constructor() {
        super();
        this.state = {
            dialog: {
                open: false,
                message: null
            }
        }

        this.style = {
            paper: {
                display: "block",
                margin: 10,
                marginTop: 20,
                marginBottom: 20,
                padding: 15,
                boxSizing: "border-box"
            },
            chip: {
                margin: 5,
                fontWeight: 'bold',
                display: 'inline-block'
            },
            infoP: {
                backgroundColor: grey800,
                padding: 10,
                boxSizing: "border-box",
                marginTop: 10,
                marginBottom: 10

            }
        }
    }

    handleDialogClose() {
        this.setState({
            dialog: {
                open: false,
                message: null,
            }
        });
    }

    componentDidMount() {

    }

    render() {
        let dialogActions = [
            <RaisedButton onClick={this.handleDialogClose.bind(this)} label="Close" />
        ]
        return (
            <div className="settings container">
                <Paper style={this.style.paper} zDepth={4}>
                    this is rat build settings ?
                </Paper>

                <Divider />

                <Paper style={this.style.paper} zDepth={4}>

                </Paper>

            
                <Divider />

                <Paper style={this.style.paper} zDepth={4}>

                </Paper>

                <Dialog
                    actions={dialogActions}
                    modal={false}
                    open={this.state.dialog.open}
                    onRequestClose={this.handleDialogClose.bind(this)}
                >
                    {this.state.dialog.message}
                </Dialog>
            </div>
        );
    }
}