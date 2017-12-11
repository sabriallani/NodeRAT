// { OS, FullNameVersion, Arch, Version, Network, Memory, User }

module.exports = new class deviceinfo{
    get(){
        const os = require("os");
        const formatBytes = require("./formatbytes");

        let OS = os.type(),
            Arch = os.arch(),
            FullNameVersion = "Unknown",
            Version = os.release(),
            _net = os.networkInterfaces(),
            Network = {
                public: {
                    ip: null,
                    country: "",
                    city: "",
                    publicAPIdata: {},
                    error : false
                },
                wifi: (_net["Wi-Fi"] != undefined) ? _net["Wi-Fi"] : _net[Object.keys(_net)[1]],
                eth0: (_net["eth0"] != undefined) ? _net["eth0"] : _net[Object.keys(_net)[0]],
                local:{
                    connected : null,
                    gateway : null
                }
            },
            Memory = {
                total: formatBytes(os.totalmem())
            },
            
            User = {
                username: os.userInfo().username,
                computerName: os.hostname()
            };


        if (/windows/i.test(OS)) {
            Version = Version.toString();
            let tmp = "",
                tmpVersion = Version.split(".");
            if (tmpVersion.length >= 2) {
                if (tmpVersion[0] == "6" && tmpVersion[1] == "1")
                    tmp = "7";

                if (tmpVersion[0] == "6" && tmpVersion[1] == "2")
                    tmp = "8";

                if (tmpVersion[0] == "6" && tmpVersion[1] == "3")
                    tmp = "8.1";

                if (tmpVersion[0] == "10")
                    tmp = "10";
            } else {
                tmp = "";
            }

            FullNameVersion = `Windows ${tmp}`;
        }

        if (/linux/i.test(OS)) FullNameVersion = `Linux ${Version}`;
        return { OS, FullNameVersion, Arch, Version, Network, Memory, User };
    }
}