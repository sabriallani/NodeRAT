class Tools {

    randomStr(len = 20, chars = null, add = null){
        len = len ? len : 20;
        chars = chars ? chars : "qwertyuiopasdfghjklzxcvbnmZXCVBNMASDFGHJKLQWERTYUIOP";
        chars += add ? add : "";
        chars = chars.split("");
        let random = [];
        let randomIndex = 0;

        while(random.length < len){
            randomIndex = Math.floor(Math.random() *  chars.length);
            random.push( chars[randomIndex] );
        }

        let final = random.join("").replace(/,/g , "");
        return final;
    }

}

let tools = new Tools();

module.exports = tools;