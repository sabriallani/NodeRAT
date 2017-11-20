const { EventEmitter } =  require("events");
const dispatcher =  require("../dispatcher");

class NodeCoreStore extends EventEmitter{
    constructor(){
        super();
        // this.startup = null;
        this.vars = {};
    }

    getVar(variable){
        return this.vars[variable]  && typeof this.vars[variable] != "function" ? this.vars[variable] : null;
    }

    getType(variable){
        return typeof this.vars[variable];
    }

    getAll(){
        return this.vars;
    }

    updateVar(variable, payload){
        this.vars[variable] = payload;
        this.emit(`${variable}@UPDATED`, payload);
    }

    setVar(variable, payload){
        this.vars[variable] = payload;
        this.emit(`${variable}@CREATED`, payload);
    }

    deleteVar(variable){
        if(this.vars[variable]){
            delete this.vars[variable];
            this.emit(`${variable}@DELETED`);
        }
    }

    handleAction(action){
        switch(action.type){
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

let nodeCoreStore = new NodeCoreStore;

dispatcher.register(nodeCoreStore.handleAction.bind(nodeCoreStore));

module.exports = nodeCoreStore;