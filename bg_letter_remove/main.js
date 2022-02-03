function $(element) {
    if(document.querySelectorAll(element).length !== 1) {
        return document.querySelectorAll(element);
    } else {
        return document.querySelector(element)
    }
}

const predefined_letters = {
    "A": [8,9,13,16,19,20,21,22,25,28],
    "B": [1,2,3,7,10,13,14,15,19,22,25,26,27],
    "C": [2,3,7,13,19,26,27],
    "D": [1,2,3,7,10,13,16,19,22,25,26,27],
    "E": [1,2,3,7,13,14,19,25,26,27],
    "F": [1,2,3,7,13,14,19,25],
    "G": [2,3,4,7,13,15,16,19,22,26,27,28],
    "H": [1,4,7,10,13,14,15,16,19,22,25,28],
    "I": [3,9,15,21,27],
    "J": [4,10,16,19,22,26,27],
    "K": [1,4,7,9,13,14,19,21,25,28],
    "L": [1,7,13,19,25,26,27,28],
    "M": [0,5,6,7,10,11,12,14,15,17,18,23,24,29],
    "N": [1,4,7,8,10,13,14,15,16,19,21,22,25,28],
    "O": [2,3,7,10,13,16,19,22,26,27],
    "P": [1,2,3,7,9,13,14,15,19,25],
    "Q": [1,2,3,7,8,9,13,14,15,21,27],
    "R": [1,2,3,7,9,13,14,19,21,25,27],
    "S": [2,3,7,14,15,22,26,27],
    "T": [1,2,3,4,8,9,14,15,20,21,26,27],
    "U": [1,4,7,10,13,16,19,22,26,27],
    "V": [1,3,7,9,13,15,19,21,26],
    "W": [0,5,6,11,12,17,18,20,21,23,25,28],
    "X": [1,4,7,10,14,15,19,22,25,28],
    "Y": [1,3,7,9,14,20,26],
    "Z": [1,2,3,4,9,14,19,25,26,27,28],
    " ": []
}
const clickable = $(".clickable");
let remaining_clickables = [];
let active_box;


/*
========
Create elements in the clickable area
========
*/
function start() {
    clickable.style.display = "flex"
    clickable.innerHTML = ""
    remaining_clickables = [];

    let c = 0;
    while(c !== 30) {
        let el = document.createElement("span");
        el.classList.add("click")
        el.id = c;
        remaining_clickables.push(c);
        clickable.appendChild(el);
        c++ // no, not the language

        // remove the clickable upon click
        el.addEventListener("click", () => {
            remaining_clickables = remaining_clickables.filter(a => a !== parseInt(el.id));
            el.remove();
        })
    }

    // set an absolute positioning so it doesn't flex weirdly
    let positions = {}
    $(".click").forEach(click => {
        let left = click.getBoundingClientRect().left - clickable.getBoundingClientRect().left;
        let top = click.getBoundingClientRect().top - clickable.getBoundingClientRect().top;
        positions[click.id] = [left, top]
    })
    for(i in positions) {
        document.getElementById(i).style.position = "absolute"
        document.getElementById(i).style.left = positions[i][0] + "px"
        document.getElementById(i).style.top = positions[i][1] + "px"
    }
    clickable.style.display = "block";
}

/*
========
Enter key == compare the drawing to predefined_letters
========
*/
document.addEventListener("keydown", (e) => {
    if(e.key.toLowerCase() == "enter") {
        let letter = "";


        for(let l in predefined_letters) {
            if(JSON.stringify(remaining_clickables) == JSON.stringify(predefined_letters[l])) {
                letter = l;
            }
        }


        if(remaining_clickables.length == 30) {
            // if nothing is removed end the whole thing
            $(".keyboard").style.display = "none"
            active_box.value =  $(".keyboard-preview-text").value
        }


        // append to the textbox
        $(".keyboard-preview-text").value += letter;

        // regen
        start();
    }
})

/*
========
Render a predefined letter
I used this in debugging but leaving it in there.
========
*/
function draw_predefined(letter) {
    start();
    remaining_clickables = predefined_letters[letter];
    $(".click").forEach(click => {
        if(!remaining_clickables.includes(parseInt(click.id))) {
            click.remove();
        }
    })
}

/*
========
Bring up the keyboard when .keyboard-bringup is clicked
========
*/
$(".keyboard-bringup").forEach(box => {
    box.addEventListener("click", () => {
        $(".keyboard").style.display = "block";
        active_box = box;
        start();
    })
})

/*
========
Basic touch support - mark the letter as done when touched outside the body 
========
*/
document.addEventListener("touchstart", (e) => {
    if(!e.path.includes($(".keyboard")) && !e.path.includes($(".login"))) {
        document.dispatchEvent(new KeyboardEvent("keydown", {key: "Enter"}))
    }
})