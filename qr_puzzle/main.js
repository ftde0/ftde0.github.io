function $(element) {
    if(document.querySelectorAll(element).length !== 1) {
        return document.querySelectorAll(element);
    } else {
        return document.querySelector(element)
    }
}
let bnds = $(".puzzle").getBoundingClientRect();

const qr_images = ["01-01", "02-01", "03-01", "04-01",
                    "01-02", "02-02", "03-02", "04-02",
                    "01-03", "02-03", "03-03", "04-03",
                    "01-04", "02-04", "03-04", "04-04"];

// shuffle
function array_shuffle(inp) {
    let tmp = [...inp]
    let out = [];

    while(out.length !== inp.length) {
        let el = tmp[Math.floor(Math.random() * tmp.length)];
        out.push(el)
        tmp = tmp.filter((s => s !== el))
    }

    return out;
}

// generate qr puzzle in random order
array_shuffle(qr_images).forEach(image => {
    let img = document.createElement("img");
    img.src = `./tiles/${image}.png`
    img.draggable = false;
    $(".puzzle").appendChild(img)
})

// unflex puzzles
setTimeout(function() {
    $(".puzzle img").forEach(img => {
        let img_bnds = img.getBoundingClientRect();
        
        img.style.left = img_bnds.left - bnds.left + "px"
        img.style.top = img_bnds.top - bnds.top + "px"
    })

    $(".puzzle img").forEach(img => {
        img.style.position = "absolute"
    })
}, 10)

// custom round
const round_table = [0, 64, 128, 192]
function custom_round(num) {
    let working = [];
    round_table.forEach(round => {
        if(num - 30 <= round) {
            working.push(round)
        }
    })

    return working[0];
}


// puzzle focus
let focusedImg;

$(".puzzle").addEventListener("mousedown", (e) => {
    if(e.path[0].tagName.toLowerCase() !== "img") return;
    focusedImg = e.path[0]
    focusedImg.style.zIndex = 9;
})

$(".puzzle").addEventListener("mouseup", (e) => {
    focusedImg.style.zIndex = "";
    focusedImg = "";
})

// drag puzzles
$(".puzzle").addEventListener("mousemove", (e) => {
    if(e.buttons !== 1 || e.path[0].tagName.toLowerCase() !== "img" || focusedImg !== e.path[0]) return;

    let img = e.path[0]
    img.style.left = e.pageX - bnds.left - 30 + "px"
    img.style.top = e.pageY - bnds.top - 30 + "px"
})

// reset bounds when resized + gray overlay positioning
window.addEventListener("resize", () => {
    bnds = $(".puzzle").getBoundingClientRect();
    $(".puzzle-gray-overlay").style.left = bnds.left + "px"
    $(".puzzle-gray-overlay").style.top = bnds.top + "px"
})

// snap to grid
$(".snap").addEventListener("click", () => {
    $(".puzzle img").forEach(img => {
        img.style.left = custom_round(parseInt(img.style.left)) + "px"
        img.style.top = custom_round(parseInt(img.style.top)) + "px"
    })
})