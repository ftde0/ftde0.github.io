const ws = require("ws");
const https = require("https")
const fs = require("fs");
const server_lang = {
    "console_connect": "$1 connected.",
    "console_start": "starting a new game between $1 and $2.\n=======",
    "alert_loss": "you lost :(<br>your page will be refreshed so you can try again.",
    "alert_gg": "$1 lost. gg!"
}
const websocket_port = 613;
const map_predefined_loss_right = [20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 240, 260, 280, 300, 320, 340, 360, 380, 400]
const map_predefined_loss_left = [19, 39, 59, 79, 99, 119, 139, 159, 179, 199, 219, 239, 259, 279, 299, 319, 339, 359, 379, 399] // i gave up trying to do this using maths
let sockets = [];
let player_queue = [];

console.log("=======")

/*
=======
websocket
=======
*/
const server = new ws.Server({
    port: websocket_port
});
  
server.on('connection', function(socket) {

    socket.on('message', function(msg) {
        msg = JSON.parse(msg)
        switch(msg.type) {
            case "hello": {
                if(unescape(msg.name).length == 0) return;
                // initial info
                socket["name"] = unescape(msg.name)
                socket["position"] = Math.floor(Math.random() * 350) + 15
                while(map_predefined_loss_right.includes(socket["position"]) || map_predefined_loss_left.includes(socket["position"])) {
                    socket["position"] = Math.floor(Math.random() * 350) + 15
                }
                socket["direction"] = 1
                socket["color"] = [Math.floor(Math.random() * 210), Math.floor(Math.random() * 210), Math.floor(Math.random() * 210)]
                socket["turn_queue"] = []
                socket["blocks_taken"] = []
                socket["state"] = "waiting"
                sockets.push(socket)
                player_queue.push(socket)
                console.log(server_lang.console_connect.replace("$1", socket["name"]))

                socket.send(JSON.stringify({"type": "looking"}))
                if(player_queue.length >= 2) {
                    player_queue = player_queue.filter((s => s !== socket))
                    // add a 2 to the name if both players have the same one
                    if(socket["name"] == player_queue[0]["name"]) {
                        socket["name"] += "2"
                    }
                    // start
                    gameStart(player_queue[0], socket)
                    player_queue[0]["state"] = "playing"
                    socket["state"] = "playing"
                    player_queue.shift()
                }

                break;
            }
            case "dir": {
                // change direction the socket draws in
                if(!socket["turn_queue"]) return;
                switch(msg.v) {
                    case "left": {
                        if(socket["direction"] == -1 || socket["direction"] == 1) return;
                        socket["turn_queue"].push(-1)
                        break;
                    }
                    case "right": {
                        if(socket["direction"] == 1 || socket["direction"] == -1) return;
                        socket["turn_queue"].push(1)
                        break;
                    }
                    case "up": {
                        if(socket["direction"] == -20 || socket["direction"] == 20) return;
                        socket["turn_queue"].push(-20)
                        break;
                    }
                    case "down": {
                        if(socket["direction"] == 20 || socket["direction"] == -20) return;
                        socket["turn_queue"].push(20)
                        break;
                    }
                }
                break;
            }
        }
    });

    socket.on('close', function() {
        if(!socket.name) return;

        sockets = sockets.filter((s => s !== socket))
        player_queue = player_queue.filter((s => s !== socket))

    });
});

/*
=======
broadcast to 2 players (any message)

pls add variables in json value nameeeeeees it hurtsssss
=======
*/
function sendToSockets(socket1, socket2, message) {
    try {
        socket1.send(JSON.stringify(message)
                .split("s1name")
                .join(escape(socket1["name"]))
                .split("s2name")
                .join(escape(socket2["name"])))
        socket2.send(JSON.stringify(message)
                .split("s1name")
                .join(escape(socket1["name"]))
                .split("s2name")
                .join(escape(socket2["name"])))
    }
    catch(error) {}
}

/*
=======
game between 2 players
=======
*/
function gameStart(socket1, socket2) {
    console.log(server_lang.console_start.replace("$1", socket1["name"]).replace("$2", socket2["name"]))
    // initial data
    let s1name = escape(socket1["name"])
    let s2name = escape(socket2["name"])
    sendToSockets(socket1, socket2, {"type": "players", "names": [s1name, s2name], "colors": {s1name: socket1["color"], s2name: socket2["color"]}})
    sendToSockets(socket1, socket2, {"type": "heads", "value": {s1name: socket1["position"], s2name: socket2["position"]}})

    // game logic
    let cycle = setInterval(function() {
        // movement
        [socket1, socket2].forEach(socket => {
            if(socket["turn_queue"][0]) {
                socket["direction"] = socket["turn_queue"][0]
                socket["turn_queue"].shift()
            }
            socket["blocks_taken"].push(socket["position"])
            socket["position"] += socket["direction"]

            if(// crashing
                socket1["blocks_taken"].includes(socket["position"]) ||
                socket2["blocks_taken"].includes(socket["position"]) ||
                // top-down walls
                socket["position"] < 0 ||
                socket["position"] > 400 ||
                // right-left walls
                (socket["direction"] == 1 && map_predefined_loss_right.includes(socket["position"])) ||
                (socket["direction"] == -1 && map_predefined_loss_left.includes(socket["position"]))) {
                    // lost :(
                    sendToSockets(socket1, socket2, {"type": "game_end"})
                    socket["blocks_taken"] = []
                    socket.send(JSON.stringify({"type": "alert", "value": server_lang.alert_loss}))
                    socket.send(JSON.stringify({"type": "loss"}))
                    socket.close()
                    // only sends to the alive guy (winner)
                    sendToSockets(socket1, socket2, {"type": "win"})
                    sendToSockets(socket1, socket2, {"type": "alert", "value": server_lang.alert_gg.replace("$1", socket["name"])})
                    // close whichever one is still online
                    try {
                        socket1.close()
                        socket2.close()
                    }
                    catch(error) {}
                    clearInterval(cycle)
            }
        })

        // send appropriate data
        sendToSockets(socket1, socket2, {"type": "block_data", "value": {s1name: socket1["blocks_taken"], s2name: socket2["blocks_taken"]}})
        sendToSockets(socket1, socket2, {"type": "heads", "value": {s1name: socket1["position"], s2name: socket2["position"]}})
    }, 250)
}


/*
=======
don't crash the whole thing when something went wrong
=======
*/
process.on("uncaughtException", (error) => {
    console.log(error.stack)
})