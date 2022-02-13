function $(element) {
    if(document.querySelectorAll(element).length !== 1) {
        return document.querySelectorAll(element);
    } else {
        return document.querySelector(element)
    }
}
const numFormat = "=== ===-===="
const numLength = 10;
let points = 0;


/*
=======
Number formatting
=======
*/
function formatNumber() {
    let pts = points.toString()
    let number = numFormat
    
    // add leading zeros
    while(pts.length < numLength) {
        pts = "0" + pts
    }

    // apply to numFormat
    pts.split("").forEach(num => {
        number = number.replace("=", num)
    })

    return number;
}


/*
=======
Spawn thingies popping out randomly (no, not drawing moles, i'm a horrible drawer)
=======
*/
let x = setInterval(function() {
    let point = Math.floor(Math.random() * 8);
    $(".hole")[point].style.background = "#ffa100";
    setTimeout(function() {
        $(".hole")[point].style.background = "";
    }, 725)
}, 925)



/*
=======
When clicked count a point
=======
*/
$(".hole").forEach(hole => {
    hole.addEventListener("click", () => {
        if(hole.style.background == "#ffa100" || hole.style.background == "rgb(255, 161, 0)") {
            points++;
            $(".number").innerHTML = formatNumber();
            hole.style.background = ""
        }
    })
})



/*
========
Mark as done
========
*/
document.addEventListener("keydown", (e) => {
    if(e.key.toLowerCase() == "enter") {
        $("h2").innerHTML = "Submitting your number as " + $(".number").innerHTML + ". Thank you!"
        clearInterval(x);
        $(".game").style.display = "none"
    }
})




/*
========
Basic touch support
========
*/
document.addEventListener("touchstart", (e) => {
    if(!e.path.includes($(".activity"))) {
        document.dispatchEvent(new KeyboardEvent("keydown", {key: "Enter"}))
    }
})