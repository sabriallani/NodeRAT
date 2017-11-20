const { EventEmitter } = require("events");
const dispatcher = require("../dispatcher");

class networkSettingsStore extends EventEmitter {
    constructor() {
        super();
        this.startup = null;
    }

    getVar(variable) {
        return this[variable] && typeof this[variable] != "function" ? this[variable] : null;
    }

    updateVar(variable, payload) {
        this[variable] = payload;
        this.emit(`${variable}_UPDATED`, this[variable]);
    }

    setVar(variable, payload) {
        this[variable] = payload;
        this.emit(`${variable}_CREATED`, this[variable]);
    }

    deleteVar(variable) {
        if (this[variable]) {
            delete this[variable];
            this.emit(`${variable}_DELETED`);
        }
    }

    handleAction(action) {
        switch (action.type) {
            case "UPDATE":
                this.updateVar(action.payload[0], action.payload[1]);
                break;

            case "DELETE":
                this.deleteVar(action.payload);
                break;

            case "SET":
                this.setVar(action.payload[0], action.payload[1]);
                break;
        }
    }
}

let network = new networkSettingsStore;

dispatcher.register(network.handleAction.bind(network));

module.exports = network;