const dispatcher = require("../dispatcher");

class ServerAction {

    set(variable, data) {
        dispatcher.dispatch({
            type: `SET`,
            payload: [variable, data]
        });
    }

    update(variable, data) {
        dispatcher.dispatch({
            type: `UPDATE`,
            payload: [variable, data]
        });
    }

    delete(variable) {
        dispatcher.dispatch({
            type: `DELETE`,
            payload: variable
        });
    }

    push(variable, data){
        dispatcher.dispatch({
            type : "PUSH",
            payload: [variable ,data]
        });
    }

}

let serverAction = new ServerAction;

module.exports = serverAction;