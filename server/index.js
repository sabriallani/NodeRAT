const net = require("net");
const { EventEmitter } = require("events");

function md5(str) {
    let hash = crypto.createHash("md5");
    hash.update(str);
    return hash.digest("hex");
}

class Server extends EventEmitter{
    constructor(){
        super();
        console.log("server started");
        this.connectedGuests = {};
        this.port = 1528;
    }

    start(){
        this.server = net.createServer((conn) => {

            let ip = conn.remoteAddress;

            this.connectedGuests[ip] = {
                conn,
                status: 1
            };

            console.log(ip, "connected");
            conn.on("end", () => {
                if (this.connectedGuests[ip])
                    this.connectedGuests[ip].status = 0;
                console.warn(ip, "disconnected");
            });

            conn.on("data", (data) => {
                console.log("\n","DATA >", data.toString(), "\n");
                if (data.toString() == "whois")
                    conn.write(md5("noderatistheboss"));
            });
        });
        this.server.listen(this.port, "0.0.0.0");
    }

}
module.exports = new Server;