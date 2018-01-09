import React from "react";
import * as ServerConstants from "./general/serverConstants";
import { Divider, Toggle, Paper , Chip, IconButton, Dialog, RaisedButton} from "material-ui";
import { blueGrey100, deepOrange200, red500, grey800, deepOrange300, green50} from "material-ui/styles/colors";


export default class General extends React.Component{
    constructor(){
        super();
        this.app = Renderer.data.process.app;

        this.state = {
            runOnStartUp : false,
            dialog:{
                open : false,
                message: null
            },
            showVictimsStatus : {
                label : "Show Offline Victims",
                status : null,
                loading : true
            }
        }

        this.style = {
            paper : {
                display: "block",
                margin : 10,
                marginTop: 20,
                marginBottom: 20,
                padding: 15,
                boxSizing: "border-box"
            },
            chip:{
                margin: 5,
                fontWeight: 'bold',
                display: 'inline-block'
            },
            infoP:{
                backgroundColor: grey800,
                padding: 10,
                boxSizing: "border-box",
                marginTop: 10,
                marginBottom: 10

            }
        }
    
    }

    handleDialogClose(){
        this.setState({
            dialog : {
                open : false,
                message : null,
            }
        });
    }

    setOfflineVictimsProxy(e, s){

        let showVictimsStatusState = this.state.showVictimsStatus;
        showVictimsStatusState.loading = true;
        this.setState({ showVictimsStatus: showVictimsStatusState });
        
       ServerConstants.setShowVictims(e,s)
            .then((event, config) => {
                console.log("config:", config);
                let [err, response] = config;
                if (typeof response != "boolean")
                    showVictimsStatusState.label = "something went wrong, restart the app";

                showVictimsStatusState.status = response;
                showVictimsStatusState.loading = false;
                this.setState({ showVictimsStatus: showVictimsStatusState });
            })
            .catch(console.log);

    }

    componentDidMount() {
        // show loader ASAP

        let showVictimsStatusState = this.state.showVictimsStatus;
        showVictimsStatusState.loading = true;
        this.setState({ showVictimsStatus: showVictimsStatusState });

        ServerConstants.getShowVictim()
            .then((response, e) => {
                console.log("Constants:", response, e);
                if (response.hasOwnProperty("hideOfflineSlaves")) {
                    showVictimsStatusState.status = response.hideOfflineSlaves;
                    showVictimsStatusState.loading = false;

                    this.setState({ showVictimsStatus: showVictimsStatusState });
                } else {
                    console.log("state:", this.state.showVictimsStatus, "constants", response);
                    alert("could not find object property ('hideOfflineSlaves') in state memory");
                }

            })
            .catch((err, e) => {
                console.log("Constants:", err);
                showVictimsStatusState.status = null;
                showVictimsStatusState.loading = false;
                showVictimsStatusState.label = "Error: something went wrong :(";

                this.setState({ showVictimsStatus: showVictimsStatusState });

                let c = confirm("NodeRAT encountered some problems while loading settings and it needs to restart");
                if (c) {

                    ipcRenderer.send("Stores:method", {
                        store: "CoreStore",
                        method: "customEvent",
                        methodParams: ["RestartApplication"]
                    });

                } else {
                    alert(`NodeRAT will not run properly, please restart the application. \n
                    \ryou will encounter slow pc performance or memory leak,\n\ranyways just restart the app.`);
                }

            });

    }

    render(){
        let dialogActions = [
            <RaisedButton onClick={this.handleDialogClose.bind(this)}  label="Close"/>
        ]
        return(
            <div className="settings container">
                {/* <Paper style={this.style.paper} zDepth={4}>
                    <Toggle
                        label="Run NodeRAT on Startup"
                        defaultToggled={false}
                        toggled={this.state.runOnStartUp}
                        onToggle={this.setStartUp.bind(this)}
                    />
                </Paper>

                <Divider /> */}
                {/*TODO: available in future it's might not work correctly for now.
                         it needs to be tested on windowns and linux.*/}

                <Paper style={this.style.paper} zDepth={4}>
                    <div>
                        View
                    </div>
                    <br />
                    <Divider/>
                    <br />

                    <div>
                        <Toggle
                            label={this.state.showVictimsStatus.label + (this.state.showVictimsStatus.loading == true ? " (Loading Settings)" : "")}
                            disabled={this.state.showVictimsStatus.status == null ? true : false}
                            toggled={this.state.showVictimsStatus.status}
                            onToggle={this.setOfflineVictimsProxy.bind(this)}
                        />
                    </div>

                </Paper>

                <Divider />

                <Paper style={this.style.paper} zDepth={4}>
                    <div>
                        About Application
                    </div>
                    <br />
                    <Divider/>
                    <br />

                    <div>
                        <Chip labelColor={blueGrey100} style={this.style.chip}>NodeRAT {this.app.version}</Chip> ({this.app.name}@{this.app.version} stable)
                    </div>

                    <div>
                       &nbsp; Made by <Chip labelColor={deepOrange200} style={this.style.chip}>
                            {this.app.author}
                        </Chip> with a lot of
                        <IconButton disableTouchRipple={true} iconStyle={{ color: red500 }} iconClassName="fa fa-code" tooltipPosition="top-center" tooltip="Code" />
                        <IconButton disableTouchRipple={true} iconStyle={{ color: red500 }} iconClassName="fa fa-coffee" tooltipPosition="top-center" tooltip="Tea" />
                        <IconButton disableTouchRipple={true} iconStyle={{ color: red500 }} iconClassName="fa fa-heart" tooltipPosition="top-center" tooltip="Love" />
                    </div>
                </Paper>

                <Divider />

                <Paper style={this.style.paper} zDepth={4}>
                    <div>
                        Links
                    </div>

                    <br/>
                    <Divider />
                    <br/>

                    <div>
                        <p style={this.style.infoP}>
                            Future Release Download <a href="#" onClick={e => openLink(`${this.app.url}`)}> Github</a>
                        </p>

                        <p style={this.style.infoP}>
                            Bug report / Future Request <a href="#" onClick={e => openLink(`${this.app.url}/issues`)}> Github</a>
                        </p>

                        <p style={this.style.infoP}>
                            Instagram <a href="#" title="DM us for any help" onClick={e => openLink("https://instagram.com/node.rat")}> @node.rat</a>
                        </p>
                    </div>

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