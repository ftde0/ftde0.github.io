function $(element) {
    if(document.querySelectorAll(element).length !== 1) {
        return document.querySelectorAll(element);
    } else {
        return document.querySelector(element)
    }
}

const rotate_assignments = {
    "-4_-11": "a",
    "-14_-21": "b",
    "-23_-30": "c",
    "-32_-40": "d",
    "-42_-49": "e",
    "-51_-56": "f",
    "-58_-64": "g",
    "-67_-74": "h",
    "-77_-80": "i",
    "-81_-85": "j",
    "-87_-95": "k",
    "-96_-99": "l",
    "-101_-114": "m",
    "-117_-124": "n",
    "-126_-134": "o",
    "-136_-143": "p",
    "-145_-153": "q",
    "-155_-161": "r",
    "-162_-167": "s",
    "-169_-175": "t",
    "-176_-183": "u",
    "-184_-192": "v",
    "-194_-204": "w",
    "-205_-213": "x",
    "-214_-221": "y",
    "-223_-229": "z"
}

let openInput = false
/*
=======
bring up our spinny thing when an input is clicked
=======
*/
$(".fi").forEach(input => {
    input.addEventListener("click", () => {
        openInput = input;
        $(".context").classList.add("hide")
        $(".main").classList.remove("hide")
        $(".entered-text").innerHTML = ""
        $(".character").innerHTML = ""
    })
})

/*
=======
connect to ws and get basic info
=======
*/
const ws = new WebSocket("ws://localhost:9504/")

ws.addEventListener("open", () => {
    ws.send(JSON.stringify({"type": "code-request"}))
})

/*
=======
message handling
=======
*/
let wheel_rotate = 0;
let spin_debounce = false;
ws.addEventListener("message", (m) => {
    m = JSON.parse(m.data);
    switch(m.type) {
        // fill the code
        case "code": {
            $(".connect-code").innerHTML = m.value
            break;
        }
        // successful connection
        case "device-connect": {
            $(".connect-code").innerHTML = "✔️ " + $(".connect-code").innerHTML
            break;
        }
        // show the spin wheel on pos 0
        case "show-wheel": {
            $(".main").classList.add("hide")
            $(".spin-wheel").classList.remove("hide")
            $(".wheel").style.transform = ""
            $(".character").innerHTML = ""
            wheel_rotate = 0;
            break;
        }
        // wheel spin
        case "spin-add": {
            if(spin_debounce || parseInt(m.value) >= 200) return;

            spin_debounce = true;
            setTimeout(function() {
                spin_debounce = false;
            }, 5)
            wheel_rotate -= parseInt(m.value)
            if(wheel_rotate <= -360) {
                wheel_rotate = 0;
            }
            $(".wheel").style.transform = `rotate(${wheel_rotate}deg)`
            break;
        }
        // spin end, analyze
        case "spin-end": {
            let character = false;
            for(let l in rotate_assignments) {
                let beginning = parseInt(l.split("_")[0])
                let end = parseInt(l.split("_")[1])

                // we're dealing with negative numbers so
                if(wheel_rotate <= beginning && wheel_rotate >= end) {
                    character = rotate_assignments[l]
                }
            }

            if(character) {
                $(".character").innerHTML = character
                $(".action-buttons").classList.remove("hide")
            } else {
                $(".character").innerHTML = "Try spinning again."
            }
        }
    }
})

ws.addEventListener("close", () => {
    if(confirm("connection lost. reload?")) {
        location.reload();
    }
})

/*
=======
action buttons that pop up on spin-end
=======
*/
$(".button-enter-char").addEventListener("click", () => {
    $(".entered-text").innerHTML += $(".character").innerHTML;
    $(".character").innerHTML = ""
})
$(".button-done").addEventListener("click", () => {
    openInput.value += $(".entered-text").innerHTML
    $(".context").classList.remove("hide")
    $(".spin-wheel").classList.add("hide")
})