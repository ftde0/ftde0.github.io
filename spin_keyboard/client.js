function $(element) {
    if(document.querySelectorAll(element).length !== 1) {
        return document.querySelectorAll(element);
    } else {
        return document.querySelector(element)
    }
}

const ws = new WebSocket("ws://localhost:9504/")
let spinTime = false;

/*
=======
connect
=======
*/
$(".connect-btn").addEventListener("click", () => {
    ws.send(JSON.stringify({
        "type": "code-connect",
        "value": $(".connect-code-input").value
    }))
})

/*
=======
message handling
=======
*/
ws.addEventListener("message", (m) => {
    m = JSON.parse(m.data);
    switch(m.type) {
        // show an align screen once a connection was made
        case "connect-success":
        case "realign": {
            $(".main").classList.add("hide")
            $(".align-screen").classList.remove("hide")
            break;
        }
        // of if it wasn't show an alert
        case "connect-fail": {
            alert("Connection failed. Make sure you have typed the code correctly.")
            break;
        }
        // reset everything for next letter
        case "reset": {
            $(".spin-ready").classList.add("hide")
            $(".align-screen").classList.remove("hide")
            $(".align-screen h1").innerHTML = `
            Recalibrate:<br>
            Lay your device on a flat surface,<br>
            Align it in portrait mode.<br>
            Press OK once done to spin again.`
            spinTime = false;
            break;
        }
    }
})

/*
=======
spinning
=======
*/
$(".confirm-btn").addEventListener("click", () => {
    ws.send(JSON.stringify({
        "type": "ready"
    }))
    spinTime = true;
    $(".align-screen").classList.add("hide")
    $(".spin-ready").classList.remove("hide")
})

let debounce = false;
let last_alpha = 0;
let relative_alpha = 0;
window.addEventListener("deviceorientation", (event) => {
    if(!spinTime || debounce) return;

    debounce = true;
    setTimeout(function() {
        debounce = false;
    }, 10)

    relative_alpha = Math.floor(event.alpha) - last_alpha

    last_alpha = Math.floor(event.alpha)
    ws.send(JSON.stringify({
        "type": "spin",
        "value": relative_alpha
    }))
}, true);

/*
=======
close
=======
*/
ws.addEventListener("close", () => {
    if(confirm("connection lost. reload?")) {
        location.reload();
    }
})