const jsonfile = require("jsonfile");


class Settings {
    constructor(){
        this.callback = null;
        this._name = "config.json";
        this._path = `${process.cwd()}/${this._name}`;
        this._config = null;
        this._autosave = false;
        this._loadfile();
    }

    _loadfile(){
        this._config = jsonfile.readFile(this._path, (err, data) => {
            if (err) throw err;
            this._config = data;
            this.callCallbacks();
        });
    }

    autoSave(save = false){
        this._autosave = save;
    }

    reload(){
        this._loadfile();
    }

    callCallbacks(){
        this.callback(this._config, this);
        this.callback = null;
    }

    onLoad(callback){
        if(typeof callback == "function")
            this.callback = callback;
    }

    get(obj = null){
        if (typeof obj == "string") {

            return obj ? this._config[obj] : this._config;
        
        } else if (typeof obj == "object" && obj instanceof Array){
            let r = {};
            for (const element of obj) {
                if (this._config.hasOwnProperty(element)) {

                    r[ element ] = this._config[element];

                }else{

                    r[ element ] = undefined;
                    
                }
            }
            return r;
        }
    }

    set({obj = null, value = null}){
        if(obj){
            this._config[obj] = value;
            let r;
            if(this._autosave)
                r = this.save();
            return [r ,this._config[obj]];
        }else{
            return this._config;
        }
    }

    save(){
        jsonfile.writeFile(this._path, this._config, (err) => {
            return err ? false : true;
        });
    }
}


const settings = new Settings();

module.exports = settings;