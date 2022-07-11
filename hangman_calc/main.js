function $(element) {
    if(document.querySelectorAll(element).length !== 1) {
        return document.querySelectorAll(element);
    } else {
        return document.querySelector(element)
    }
}

/*
=======
only allow certain characters to be entered in an input box
ihateregexsyntaxihateregexsyntaxihateregexsyntaxihateregexsyntax
=======
*/
$(".calc_display").addEventListener("input", () => {
    $(".calc_display").value = $(".calc_display").value.replaceAll(/[^0-9+.+\++\-+*+\/+\=]/gi, "")

    if($(".calc_display").value.endsWith("=")) {
        hangman();
    }
})

/*
=======
make buttons append text (except the equals one)
=======
*/
$(".keypad button").forEach(btn => {
    btn.addEventListener("click", () => {
        $(".calc_display").value += btn.innerHTML

        if(btn.innerHTML == "=") {
            hangman();
        }
    })
})

/*
=======
bring up hangman
=======
*/
function hangman() {
    $(".calc_display").value = $(".calc_display").value.replaceAll(/[^0-9+.+\++\-+*+\/+]/gi, "")
    $(".hangman").classList.remove("hide")
    let result = eval($(".calc_display").value)
    $(".fill").innerHTML = "_".repeat(result.toString().length)
}

/*
=======
hangman buttons
=======
*/
let s = 0;
$(".h_keypad button").forEach(btn => {
    btn.addEventListener("click", () => {
        // add disabled so we cant click it again
        btn.setAttribute("disabled", "")


        let result = eval($(".calc_display").value)
        if(result.toString().includes(btn.innerHTML)) {
            // includes the number
            // find where the number pops up and fill .fill based on that
            let indexes = []
            let i = 0;
            result.toString().split("").forEach(digit => {
                if(digit == btn.innerHTML) {
                    indexes.push(i)
                }
                i++;
            })


            let fullStr = $(".fill").innerHTML.split("")
            indexes.forEach(index => {
                fullStr[index] = btn.innerHTML
            })

            $(".fill").innerHTML = fullStr.join("")

            // win
            if($(".fill").innerHTML == result.toString()) {
                good_ending();
            }
        } else {
            // next hangman step if invalid
            s++;
            $("img").src = `hangman_steps/${s}.png`

            // lose if s == 5
            if(s == 5) {
                lose();
            }
        }
    })
})

/*
=======
lose dialog
=======
*/
function lose() {
    setTimeout(function() {
        $(".h_keypad").classList.add("hide")
        $(".hangman h2").innerHTML = "Welp, you didn't get it. How about you calculate manually?"
    }, 1250)
}

/*
=======
good ending - game completed
=======
*/
function good_ending() {
    setTimeout(function() {
        $(".hangman").classList.add("hide")
        $(".calc_display").value = $(".fill").innerHTML
    }, 1250)
}