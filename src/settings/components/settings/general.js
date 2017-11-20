import React from "react";
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

    getStartup(){
        // hi future me this is a mind fuck
        // it's 3:05 am that writing this so GOOD LUCK figuring this line of code.
        ipcRenderer.once("core-store-on-appStartup_UPDATE", (event, appStartup_status) => {
            ipcRenderer.send("core-store-l", "getVar", ["appStartup"], "appStartup"); 
            ipcRenderer.once("core-store-r#appStartup", (e, r)=>{
                this.setState({
                    runOnStartUp: r
                });
            });
        })
        ipcRenderer.send("core-store-on", "appStartup_UPDATE");

        ipcRenderer.once("core-store-r#appStartup2", (e, r) => {
            this.setState({
                runOnStartUp: r
            })
        });
        ipcRenderer.send("core-store-l", "getVar", ["appStartup"], "appStartup2");
    }

    sendStartup(state){
        ipcRenderer.send("core-action-l", "updateVar", ["appStartup", state], "appStartup");
        ipcRenderer.once("core-action-r#appStartup", this.getStartup.bind(this));
    }

    setStartUp(event, toggled){
        this.sendStartup(toggled);
        this.setState({
            dialog : {
                message: `NodeRAT will ${toggled ? "" : " not "} run on next startup`,
                open : true
            }
        })
    }

    handleDialogClose(){
        this.setState({
            dialog : {
                open : false,
                message : null,
            }
        });
    }

    componentDidMount() {
        this.getStartup();
    }

    render(){
        let dialogActions = [
            <RaisedButton onClick={this.handleDialogClose.bind(this)}  label="Close"/>
        ]
        return(
            <div className="settings container">
                <Paper style={this.style.paper} zDepth={4}>
                    <Toggle
                        label="Run NodeRAT on Startup"
                        defaultToggled={false}
                        toggled={this.state.runOnStartUp}
                        onToggle={this.setStartUp.bind(this)}
                    />
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
                        <IconButton disableTouchRipple={true} iconStyle={{ color: red500 }} iconClassName="fa fa-coffee" tooltipPosition="top-center" tooltip="Coffee" />
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