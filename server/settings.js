const jsonfile = require("jsonfile");


class Settings {
    constructor(){
        this.callbacks = [];
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
        for(let callback of this.callbacks )
            callback(this._config);
    }

    onLoad(callback){
        if(typeof callback == "function")
            this.callbacks.push(callback);
    }

    get(obj = null){
        return obj ? this._config[obj] : this._config;
    }

    set({obj = null, value = null}){
        if(obj){
            this._config[obj] = value;
            if(this._autosave)
                this.save()
            return this._config[obj];
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