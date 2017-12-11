const os = require("os");
const electron = require("electron");
window.remote = electron.remote;

let device = remote.require("./src/modules/deviceInfo");


const shell = electron.shell;


window.openLink = (link) => {
    if(link)
        shell.openExternal(link);
}

window.ipcRenderer = electron.ipcRenderer;

console.log(device.get());

window.Renderer = {
    data: {
        deviceInfo : device.get(),
        process : {
            versions : process.versions,
            pid : process.pid,
            app : {
                version : process.env.npm_package_version,
                name : process.env.npm_package_name,
                author: process.env.npm_package_author_name,
                url: process.env.npm_package_url
            }
        }
    }
};
