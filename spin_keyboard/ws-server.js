const ws = require("ws");
const fs = require("fs");
const https = require("https");
const port = 9504;
let server;
let sockets = []
let codeAssociate = {}

server = new ws.Server({
    port: port
});

console.log(`==spin-keyboard==`)

// random codes for everyone
function randomCharacters() {
    let length = 8;
    let r = ""
    while(r.length !== length) {
        r += "qwertyuiopasdfghjklzxcvbnm".split("")[Math.floor(Math.random() * 26)]
    }
    return r;
}

// handle communication
server.on('connection', function(socket) {
    socket.on('message', function(msg) {
        msg = JSON.parse(msg)
        switch(msg.type) {
            // generate a code
            case "code-request": {
                sockets.push(socket)
                socket["code"] = randomCharacters()
                while(codeAssociate[socket["code"]]) {
                    socket["code"] = randomCharacters()
                }
                codeAssociate[socket["code"]] = socket
                socket.send(JSON.stringify({"type": "code", "value": socket["code"]}))
                break;
            }

            // connect to a code
            case "code-connect": {
                let code = msg.value;
                let success = false;
                sockets.push(socket)
                if(codeAssociate[code]) {
                    success = true;
                    socket["sendTo"] = codeAssociate[code]
                    socket.send(JSON.stringify({"type": "connect-success"}))
                    socket["sendTo"].send(JSON.stringify({"type": "device-connect"}))
                } else {
                    socket.send(JSON.stringify({"type": "connect-fail"}))
                }
                
                break;
            }

            // ready to spin
            case "ready": {
                socket["sendTo"].send(JSON.stringify({
                    "type": "show-wheel"
                }))
                break;
            }

            // spin data
            case "spin": {
                socket["lastSpin"] = Math.floor(Date.now() / 1000)
                socket["sendTo"].send(JSON.stringify({
                    "type": "spin-add",
                    "value": Math.abs(parseInt(msg.value))
                }))

                // if not spinning for a second, send a spin-end
                setTimeout(function() {
                    if(socket["lastSpin"] !== Math.floor(Date.now() / 1000) && !socket["debounce"]) {
                        socket["debounce"] = true;
                        setTimeout(function() {
                            socket["debounce"] = false
                        }, 2000)
                        socket["sendTo"].send(JSON.stringify({
                            "type": "spin-end"
                        }))
                        socket.send(JSON.stringify({
                            "type": "reset"
                        }))
                    }
                }, 1500)
            }
        }
    });

    socket.on('close', function() {
        sockets = sockets.filter((s => s !== socket))
        delete codeAssociate[socket["code"]];
    });
});



// errors
process.on("uncaughtException", (error) => {
    console.log(error.stack)
})