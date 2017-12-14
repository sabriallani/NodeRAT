const dispatcher = require("../dispatcher");

module.exports = new class networkSettingsAction {

    setVar(variable, data) {
        dispatcher.dispatch({
            type: `SET`,
            payload: [variable, data]
        });
    }

    updateVar(variable, data) {
        dispatcher.dispatch({
            type: `UPDATE`,
            payload: [variable, data]
        });
    }

    deleteVar(variable) {
        dispatcher.dispatch({
            type: `DELETE`,
            payload: variable
        });
    }

}