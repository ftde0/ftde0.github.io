function $(element) {
    if(document.querySelectorAll(element).length !== 1) {
        return document.querySelectorAll(element);
    } else {
        return document.querySelector(element)
    }
}
let p = false;

/*
=======
bring up the captcha box
=======
*/
$(".captcha").addEventListener("click", () => {
    if(p) return;

    $(".captcha .checkbox").classList.add("load")
    setTimeout(function() {
        $(".captcha_window").style.display = "block"
    }, 3000)
})


/*
=======
checkmark draw
=======
*/

$("canvas.checkmark").addEventListener("mousemove", (e) => {
    if(e.buttons !== 1) return;

    let c = $("canvas.checkmark")
    let ctx = c.getContext('2d')
    ctx.fillStyle = "#00ff1f";

    ctx.fillRect(e.offsetX, e.offsetY, 10, 10)
})

$("canvas.checkmark").addEventListener("touchmove", (e) => {
    let c = $("canvas.checkmark")
    let ctx = c.getContext('2d')
    ctx.fillStyle = "#00ff1f";

    ctx.fillRect(e.changedTouches[0].clientX - c.getBoundingClientRect().left, e.changedTouches[0].clientY - c.getBoundingClientRect().top, 10, 10)
})

/*
=======
handwrite
=======
*/

$("canvas.handwrite").addEventListener("mousemove", (e) => {
    if(e.buttons !== 1) return;

    let c = $("canvas.handwrite")
    let ctx = c.getContext('2d')
    ctx.fillStyle = "#000000";

    ctx.fillRect(e.offsetX, e.offsetY, 5, 5)
})

$("canvas.handwrite").addEventListener("touchmove", (e) => {
    let c = $("canvas.handwrite")
    let ctx = c.getContext('2d')
    ctx.fillStyle = "#000000";

    ctx.fillRect(e.changedTouches[0].clientX - c.getBoundingClientRect().left, e.changedTouches[0].clientY - c.getBoundingClientRect().top, 10, 10)
})


/*
=======
check
=======
*/

// pixels that have to be white/green respectively (manually drawn checkmark)
const checkmark_white = [[26, 90], [35, 102], [44, 111], [50, 122], [78, 123], [89, 108], [100, 86], [117, 60]]
const checkmark_green = [[40, 87], [52, 103], [64, 112], [79, 94], [98, 66], [110, 46]]

// pixels that have to be white/black (handwrite section)
const handwrite_white = [[54, 34], [110, 41], [173, 35], [212, 40], [45, 82], [135, 80]] // random pixels to make sure someone doesn't just cover the whole thing black to pass
const handwrite_black = [[16, 30], [92, 55], [160, 64], [200, 60]]

$(".captcha_window button").addEventListener("click", () => {
    /*
    =======
    checkmark drawing
    =======
    */

    let checkmarkPass = true;
    let checkmarkCtx = $("canvas.checkmark").getContext("2d")

    // white pixels
    checkmark_white.forEach(pixel => {
        if(checkmarkCtx.getImageData(pixel[0], pixel[1], 1, 1).data[1] == 255) {
            // nope, went out
            checkmarkPass = false;
        }
    })

    // green pixels
    checkmark_green.forEach(pixel => {
        if(checkmarkCtx.getImageData(pixel[0], pixel[1], 1, 1).data[1] !== 255) {
            // nope, not green
            checkmarkPass = false;
        }
    })

    $(".incorrect")[0].style.display = "none"
    if(!checkmarkPass) {
        checkmarkCtx.clearRect(0, 0, 150, 150);
        $(".incorrect")[0].style.display = "block"
    }


    /*
    =======
    handwriting
    =======
    */
    let handwritePass = true;
    let handwriteCtx = $("canvas.handwrite").getContext("2d")

    handwrite_white.forEach(pixel => {
        if(handwriteCtx.getImageData(pixel[0], pixel[1], 1, 1).data[3] !== 0) {
            console.log("not w", pixel[0], pixel[1])
            handwritePass = false;
        }
    })

    handwrite_black.forEach(pixel => {
        if(handwriteCtx.getImageData(pixel[0], pixel[1], 1, 1).data[3] == 0) {
            console.log("missing: b", pixel[0], pixel[1])
            handwritePass = false;
        }
    })

    $(".incorrect")[1].style.display = "none"
    if(!handwritePass) {
        handwriteCtx.clearRect(0, 0, 300, 100);
        $(".incorrect")[1].style.display = "block"
    }



    /*
    =======
    final
    =======
    */
    if(handwritePass && checkmarkPass) {
        $(".captcha_window").style.display = "none"
        $(".captcha .checkbox").classList.remove("load")
        $(".captcha .checkbox").classList.add("checked")
        p = true;
    }
})