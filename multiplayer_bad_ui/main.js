let protocol = "ws"
let hostname = "localhost";
let port = 613;

let gameState = "not_joined"
let dataSent = 0;
let dataReceived = 0;
let players = []
let playerColors = {}

let lang = {
    "alert_username": "Please type a Username to enter.",
    "info_connect": `You are about to connect with the name "$1".`,
    "data_stats": "data sent: $1b<br>data received: $2b",
    "player_search": "Searching for a player...<br>$1",
    "player_opponent": "playing against $1"
}

function $(element) {
    if(document.querySelectorAll(element).length !== 1) {
        return document.querySelectorAll(element);
    } else {
        return document.querySelector(element)
    }
}

function wsend(jsonMsg) {
    ws.send(JSON.stringify(jsonMsg))
    dataSent += JSON.stringify(jsonMsg).length
    updateDataCounter()
}

/*
=======
generate blocks
=======
*/
let c = 0;
while(c !== 400) {
    $(".game").innerHTML += `<span class="block"></span>`
    c++;
}

/*
=======
send initial ws data when a "i'm not a robot" is pressed (after a 5 second timeout)
=======
*/
$("#robot").addEventListener("click", (e) => {
    e.preventDefault()
    if(gameState == "won") return;

    if(!$(".username").value) {
        alert(lang.alert_username)
        return;
    }

    $(".overlay").style.display = "block"
    $(".broadcast").innerHTML = lang.info_connect.replace("$1", $(".username").value)
    setTimeout(function() {
        wsend({
            "type": "hello",
            "name": escape($(".username").value)
        })
    }, 5000)
})


/*
=======
in game movement
=======
*/
document.addEventListener("keydown", (e) => {
    switch(e.key.toLowerCase()) {
        case "w":
        case "arrowup": {
            $(".dir_arrow").innerHTML = "🢁"
            wsend({"type": "dir", "v": "up"})
            break;
        }
        case "a":
        case "arrowleft": {
            $(".dir_arrow").innerHTML = "🢀"
            wsend({"type": "dir", "v": "left"})
            break;
        }
        case "s":
        case "arrowdown": {
            $(".dir_arrow").innerHTML = "🢃"
            wsend({"type": "dir", "v": "down"})
            break;
        }
        case "d":
        case "arrowright": {
            $(".dir_arrow").innerHTML = "🢂"
            wsend({"type": "dir", "v": "right"})
            break;
        }
    }
})

/*
=======
data sent/received counting
=======
*/
function updateDataCounter() {
    $(".data_counter").innerHTML = lang.data_stats.replace("$1", dataSent).replace("$2", dataReceived)
}
function showDataCounter() {
    $(".data_counter").style.display = "block"
}

/*
=======
websocket communication
=======
*/
let ws = new WebSocket(`${protocol}://${hostname}:${port}`);

ws.addEventListener("message", function(m) {
    dataReceived += m.data.length
    updateDataCounter()
    m = JSON.parse(m.data);
    console.log(m)

    // received a server message
    switch(m.type) {

        // looking for a player
        case "looking": {
            gameState = "waiting"
            $(".overlay").style.display = "block"
            let timeElapsed = 0;

            let li = setInterval(function() {
                if(gameState == "waiting") {
                    $(".broadcast").innerHTML = lang.player_search.replace("$1", timeElapsed)
                    timeElapsed++;
                } else {
                    clearInterval(li);
                }
            }, 1000)
            break;
        }

        // found a game - fill initial data and show the game area
        case "players": {
            gameState = "playing"
            players = m.names
            playerColors = m.colors
            let opponentName = players.filter(p => p !== escape($(".username").value))[0]
            let oc = playerColors[opponentName];
            $(".playing_with").innerHTML = lang.player_opponent.replace("$1", `<strong style="color: rgb(${oc[0]}, ${oc[1]}, ${oc[2]})">${unescape(opponentName)}</strong>`)
            $(".overlay").style.display = "none"
            $(".game_overlay").style.display = "block"
            break;
        }

        // blocks taken by players - reset the whole thing and redraw
        case "block_data": {
            $(".block").forEach(b => {b.removeAttribute("style")})

            for(let p in m.value) {
                let c = playerColors[p]
                m.value[p].forEach(block => {
                    $(".block")[block].style.background = `rgb(${c[0]}, ${c[1]}, ${c[2]})`
                })
            }
            break;
        }

        // player heads - draw them with a brighter shade of player's color so they stand out
        case "heads": {
            for(let p in m.value) {
                let r = playerColors[p][0] + 40
                let g = playerColors[p][1] + 40
                let b = playerColors[p][2] + 40
                $(".block")[m.value[p]].style.background = `rgb(${r}, ${g}, ${b})`
            }
            break;
        }

        // messages
        case "alert": {
            $(".overlay").style.display = "block"
            $(".broadcast").innerHTML = m.value;

            // remove the notification
            setTimeout(function() {
                $(".overlay").style.display = "none"
            }, 6000)
            break;
        }
        
        // game ending - cleanup
        case "game_end": {
            players = []
            playerColors = {}
            gameState = "not_joined"
            $(".game_overlay").style.display = "none"
            break;
        }

        // loss - refresh
        case "loss": {
            setTimeout(function() {
                location.reload()
            }, 6000)
            break;
        }

        // win - mark a captcha
        case "win": {
            gameState = "won"
            $("#robot").checked = true;
            break;
        }
    }
})

ws.addEventListener("close", function() {})

/*
========
Touch swiping
copied from /snake_age/
========
*/
let touchX = []
let touchY = []
document.addEventListener("touchstart", (e) => {
    touchX = [e.touches[0].clientX]
    touchY = [e.touches[0].clientY]
})
document.addEventListener("touchend", (e) => {
    let resultKey = ""
    touchX.push(e.changedTouches[0].clientX)
    touchY.push(e.changedTouches[0].clientY)
    // find what direction the touch was made in (horizontally/vertically)
    let xAxis = false;

    if(Math.abs(touchX[0] - touchX[1]) > Math.abs(touchY[0] - touchY[1])) {xAxis = true;}

    // go left/right?
    if(xAxis && touchX[0] > touchX[1]) {
        // left
        resultKey = "ArrowLeft"
    } else if(xAxis && touchX[0] < touchX[1]) {
        // right
        resultKey = "ArrowRight"
    }

    // go up/down?
    if(!xAxis && touchY[0] > touchY[1]) {
        // up
        resultKey = "ArrowUp"
    } else if(!xAxis && touchY[0] < touchY[1]) {
        // down
        resultKey = "ArrowDown"
    }



    document.dispatchEvent(new KeyboardEvent("keydown", {key: resultKey}))
})