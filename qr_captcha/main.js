const canvas = $("canvas")
const qr_parts = ["01-01", "02-01","03-01","04-01",
                "01-02","02-02","03-02","04-02",
                "01-03","02-03","03-03","04-03",
                "01-04","02-04","03-04","04-04"]
let touchScreen = false;
let current_qr = 0;
let c = $("canvas")
let ctx = c.getContext('2d')
let scale = 1;
let mouseDraw = false;

let protocol = "wss"
let hostname = "ftde-projects.tk"
let ws;


function $(element) {
    if(document.querySelectorAll(element).length !== 1) {
        return document.querySelectorAll(element);
    } else {
        return document.querySelector(element)
    }
}


// Init
$("#robot").addEventListener("click", (e) => {
    e.preventDefault();

    $(".captcha").style.display = "inline-block"
    mouseDraw = true;
    scale = c.getBoundingClientRect().width / 200
    ctx.fillStyle = "white"
    ctx.fillRect(0,0,200,200)
    ctx.fillStyle = "black"
})



// Drawing: mouse
$("img").addEventListener("mousemove", (e) => {
    if(e.buttons == 1 && mouseDraw) {
        let x = e.offsetX
        let y = e.offsetY

        ctx.fillRect(x / scale, y / scale, 10, 10)
    }
})




// Touchscreen
$("img").addEventListener("touchmove", (e) => {
    touchScreen = true;

    let x = e.changedTouches[0].clientX - $("img").getBoundingClientRect().left
    let y = e.changedTouches[0].clientY - $("img").getBoundingClientRect().top

    ctx.fillRect(x / scale, y / scale, 10, 10)
})

$("img").addEventListener("click", () => {
    if(touchScreen) {
        document.dispatchEvent(new KeyboardEvent("keydown", {key: "Enter"}))
    }
})





// Go forward
document.addEventListener("keydown", (e) => {
    if(e.key == "Enter" && mouseDraw) {
        let oC = c.cloneNode(true)
        oC.style.width = "50px"
        oC.style.height = "50px"
        oC.classList.toggle("btm")
        oC.getContext("2d").drawImage(c, 0, 0)
        $(".canvas-collection").appendChild(oC)

        current_qr++;
        
        if(current_qr == qr_parts.length) {
            // done
            c.remove()
            $("img").remove();
            $(".canvas-collection").style.display = "flex"
            $("h3").innerHTML = `Great! Now scan the QR code you just drew.<br>Assuming you drew it well enough, that is.`

            // initialize ws
            setTimeout(function() {
                ws = new WebSocket(`${protocol}://${hostname}:4850`)
                ws.addEventListener("open", () => {
                    ws.send(`mode:auth-wait`)
                })
                ws.addEventListener("message", () => {
                    // alright
                    ws.close()

                    $(".captcha").style.display = "none"
                    $("#robot").checked = true;
                    $("button").removeAttribute("disabled")
                    $("button").style.color = "rgb(255,255,255)"
                })
            }, 10000)

            return;
        }

        ctx.fillStyle = "white"
        ctx.fillRect(0,0,200,200)
        ctx.fillStyle = "black"
        $("img").src = `imgs/Pasted Layer-${qr_parts[current_qr]}.png`
    }
})