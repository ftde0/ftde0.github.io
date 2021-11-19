const ws = require("ws");
let authWaitSockets = []

// websocket
const server = new ws.Server({
    port: 4850
});
  
server.on('connection', function(socket) {

    socket.on('message', function(msg) {
        switch(msg.split(":")[1]) {
            case "auth-wait": {
                // captcha page, waiting for a pass
                authWaitSockets.push(socket)
                break;
            }
            case "auth-send": {
                if(authWaitSockets[0]) {
                    authWaitSockets[0].send("a")
                    socket.close()
                }
                break;
            }
        }
    });

    socket.on('close', function() {
        if(socket.authWait) {
            authWaitSockets = authWaitSockets.filter(s => s !== socket)
        }
    });
});




// don't crash the whole thing!
process.on("uncaughtException", (error) => {
    console.log(error.stack)
})