import React from "react";
const Net = remote.require("net");
const crypto = remote.require("crypto");
import { Divider, Toggle, Paper, Chip, IconButton, 
         Dialog, RaisedButton, TextField, FlatButton,
         LinearProgress, FontIcon, SelectField, MenuItem } from "material-ui";
import { blueGrey100, deepOrange200, red500, green500,
         grey800, grey300, deepOrange300, green50 } from "material-ui/styles/colors";
import PcInfoStore from "../../../stores/pcinfoStore";
import PcInfoAction from "../../../actions/pcinfoAction";

export default class Network extends React.Component {
    constructor() {
        super();
        this.state = {
            dialog: {
                open: false,
                message: undefined
            },
            PortTextField : {
                errorMsg : "",
                value: 1528,
                defaultValue : 0,
                valid : true
            },
            SetPortTextField : {
                errorMsg : "",
                value: 1528,
                defaultValue : 0,
                valid : null
            },
            checkPortIsOpen : {
                open : null,
                showButton : true,
                icon : "fa fa-question-circle",
                showLoader : false,
                disableButton: false
            },
            public : null,
            local : () => {
                let l = null,
                    p = PcInfoStore.getAll().Network;
                 p.wifi ? l = p.wifi : l = p.eth0;
                l.length == 2 ? l = l[1] : l = l[0];
                return l.address || "unknown";
            },
            selectField : {
                value: () => this.state.public ? this.state.public : this.state.local()
            }
        }

        // subscribe to this event
        ipcRenderer.send("core-store-on", "RATMainTCPPort@UPDATED"); 
        PcInfoStore.on("PUBLIC_IP_UPDATED", (payload) => {
                this.setState({ public: payload.ip });
        });

        // event listener
        ipcRenderer.on("core-store-on-RATMainTCPPort@UPDATED", (e, r) => {
            let PortTextFieldState = this.state.PortTextField;
            let SetPortTextFieldState = this.state.SetPortTextField;
            PortTextFieldState.value = SetPortTextFieldState.value = r;
            this.setState({
                PortTextField: PortTextFieldState,
                SetPortTextField: SetPortTextFieldState
            });
        });

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
            info: {
                backgroundColor: grey800,
                padding: 10,
                boxSizing: "border-box",
                marginTop: 10,
                marginBottom: 10

            },
            checkPortButton : {
                display: "block",
                marginTop : 10
            },
            ipPortContainer : {
                display : "flex",
                justifyContent : "space-between"
            },
            titleBox: {
                display : "block",
                width   : "100%",
                marginTop: 10,
                marginBottom: 10,
                boxSizing : "border-box",
                padding : 10,
                borderBottom : `1px solid ${grey800}`,
                fontSize : "1.5em",
                textAlign : "center"
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

    checkPortIsOpen(e){
        let newState = this.state.PortTextField;
        let port = newState.value;
        let host = this.state.selectField.value();
        const socket = new Net.Socket();
        let checkPortIsOpenState = this.state.checkPortIsOpen;

        // initial state values
        newState.value = newState.value == null || newState.value == "" || isNaN(newState.value) ? newState.defaultValue : newState.value;
        checkPortIsOpenState.icon = "fa fa-check-circle";
        checkPortIsOpenState.disableButton = true;
        checkPortIsOpenState.showLoader = true;
        checkPortIsOpenState.open = null;

        this.setState({PortTextField : newState, checkPortIsOpen : checkPortIsOpenState});

        if(this.state.public || this.state.local()){
            socket.connect({ port, host }, function () {
                socket.write("whois");
            });
            socket.on("error", e => {
                checkPortIsOpenState.open = false;
                checkPortIsOpenState.icon = "fa fa-times-circle";
                checkPortIsOpenState.showLoader = false;
                checkPortIsOpenState.disableButton = false;
                this.setState({ checkPortIsOpen: checkPortIsOpenState });
                socket.destroy();
            });
            socket.on("data", (data) => {
                let md5 = crypto.createHash("md5");
                md5.update("noderatistheboss");
                if(data == md5.digest("hex")){
                    checkPortIsOpenState.open = true;
                    checkPortIsOpenState.icon = "fa fa-check-circle";
                    checkPortIsOpenState.showLoader = false;
                    checkPortIsOpenState.disableButton = false;
                    this.setState({checkPortIsOpen : checkPortIsOpenState});
                }else{
                    checkPortIsOpenState.open = false;
                    checkPortIsOpenState.icon = "fa fa-check-circle";
                    this.setState({ checkPortIsOpen: checkPortIsOpenState });
                }
            });
            setTimeout(() => {socket.end(); console.log('closing connection')}, 60 * 1000);
        }
    }

    componentDidMount() {
       
    }

    checkPortValue(e, newVal){
        let newState = this.state.PortTextField;
        let CheckPort = this.state.checkPortIsOpen;
        newVal = newVal.toString().replace(/([a-z])+/i, "");
        if(newVal != "")
            newVal = parseInt(newVal, 10);
        if (newVal < 1024 || newVal > 65535){
            // newState.value = newVal == null || isNaN(newVal) ?  newState.defaultValue : newVal;
            newState.value = newVal;
            newState.errorMsg = "Unvalid Port";
            newState.valid = false;
            CheckPort.showButton = true;
            this.setState({PortTextField : newState});
        }else{
            // newState.value = newVal == null  || isNaN(newVal) ? newState.defaultValue : newVal;
            newState.value = newVal;
            newState.errorMsg = "";
            newState.valid = true;
            CheckPort.showButton = true;
            this.setState({ PortTextField: newState, checkPortIsOpen : CheckPort });
        }
    }
    // there's better way than same func with different names, but i'm lazy af, dear future me 
    //TODO: fix me please
    checkPortValue2(e, newVal){
        let newState = this.state.SetPortTextField;
        newVal = newVal.toString().replace(/([a-z])+/i, "");
        if(newVal != "")
            newVal = parseInt(newVal, 10);
        if (newVal < 1024 || newVal > 65535){
            newState.value = newVal;
            newState.errorMsg = "Unvalid Port";
            newState.valid = false;
            this.setState({SetPortTextField : newState});
        }else{
            newState.value = newVal;
            newState.errorMsg = "";
            newState.valid = true;
            this.setState({ SetPortTextField: newState});
        }
    }

    changeIPaddress(e, index, value){
        let selectFieldState = this.state.selectField;
        selectFieldState.value = () => value;
        this.setState({selectField : selectFieldState});
    }

    //TODO: save the port on server 

    SavePort(){
        let x = this.state.SetPortTextField;
        ipcRenderer.send("core-action-l", "updateVar", ["RATMainTCPPort", x.value],"RATMainTCPPort");
    }

    render() {
        let dialogActions = [
            <RaisedButton onClick={this.handleDialogClose.bind(this)} label="Close" />
        ]

        let portStatus = () => {
            let r;
            if (this.state.checkPortIsOpen.showLoader) {
                   r =  <p style={{ color: grey300 }}> 
                        Checking {this.state.selectField.value()} on port {this.state.PortTextField.value}
                   </p>
            } else {
                if(this.state.checkPortIsOpen.open != null){
                    r = <p style={{ color: this.state.checkPortIsOpen.open ? green500 : red500}} > 
                        {this.state.PortTextField.value} is {this.state.checkPortIsOpen.open ? 'open' : 'closed'} on {this.state.selectField.value()}
                    </p>
                }else{
                    r = <p style={{color : grey300}} >
                        Port {this.state.PortTextField.value} status is unknown on {this.state.selectField.value()}
                    </p>
                }
            }
            return r;
        }

        return (
            <div className="settings container">
                {/* check port container */}
                <Paper style={this.style.paper} zDepth={4}>
                    <div style={this.style.titleBox}>
                        Check Port Status
                    </div>
                    {
                        this.state.checkPortIsOpen.showLoader ?
                        <LinearProgress mode = "indeterminate" /> 
                        :
                        <div style={this.style.ipPortContainer}>
                                <SelectField 
                                    floatingLabelText="Select IP Address" 
                                    value={this.state.selectField.value()} 
                                    onChange={this.changeIPaddress.bind(this)}>
                                    {this.state.public && <MenuItem value={this.state.public} primaryText={this.state.public.toString()} label="Public IP Address" />}
                                    {this.state.local() && <MenuItem value={this.state.local()} primaryText={this.state.local().toString()} label="Local IP Address"/>}
                                    </SelectField>

                                <TextField
                                    id="port-textfield"
                                    floatingLabelText="Port to check"
                                    floatingLabelFixed={true}
                                    value={this.state.PortTextField.value}
                                    onChange={this.checkPortValue.bind(this)}
                                    errorText={this.state.PortTextField.errorMsg} />

                                    { !this.state.checkPortIsOpen.showLoader && <FontIcon className={this.state.checkPortIsOpen.icon} /> }
                        </div>
                    }


                    <FlatButton 
                        label={`Test connection on port ${this.state.PortTextField.value}`} 
                        primary={true} 
                        disabled={!this.state.PortTextField.valid || this.state.checkPortIsOpen.disableButton}  
                        style={this.style.checkPortButton}
                        onClick={this.checkPortIsOpen.bind(this)}
                        fullWidth={true}
                    />
                    <br />
                    { portStatus() }
                </Paper>

                {/* set port container */}
                <Paper style={this.style.paper} zDepth={4}>
                    <div style={this.style.titleBox}>
                        Set Port
                    </div>
                    <p style={this.style.info}>
                        Listening on port {this.state.PortTextField.value} for incoming connection
                    </p>
                    <TextField
                        id="setPort-textfield"
                        floatingLabelText="Port"
                        floatingLabelFixed={true}
                        value={this.state.SetPortTextField.value}
                        onChange={this.checkPortValue2.bind(this)}
                        errorText={this.state.SetPortTextField.errorMsg} 
                    />
                    <FlatButton 
                        label="Save" 
                        primary={true} 
                        disabled={!this.state.SetPortTextField.valid}  
                        style={this.style.checkPortButton}
                        onClick={this.SavePort.bind(this)}
                        fullWidth={true}
                    />

                </Paper>

                <Dialog
                    actions={dialogActions}
                    modal={false}
                    open={this.state.dialog.open}
                    onRequestClose={this.handleDialogClose.bind(this)}>
                    {this.state.dialog.message}
                </Dialog>
            </div>
        );
    }
}