function $(element) {
    if(document.querySelectorAll(element).length !== 1) {
        return document.querySelectorAll(element);
    } else {
        return document.querySelector(element)
    }
}

/*
=======
alert patch
=======
*/
window.alert = function(msg) {
    $(".alert").classList.remove("hide")
    $(".alert h1").innerHTML = msg;
    setTimeout(function() {
        $(".alert").classList.add("hide")
    }, 2500)
}

/*
=======
array shuffle
=======
*/
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

/*
=======
cups shuffling
=======
*/
function cups_shuffle() {
    $("button").classList.add("fadeout")
    $("button").style.bottom = "0px"

    setTimeout(function() {
        let index = 0;
        array_shuffle([0, 128, 256]).forEach(left => {
            $(".cup")[index].style.left = left + "px"
            index++;
        })
    }, 400)
}

/*
=======
loop cups_shuffle
=======
*/
function shuffle_loop(times) {
    // add shuffling class so the cups can't be opened mid-shuffle
    $(".cup").forEach(cup => {
        cup.classList.add("shuffling")
    })

    let elapsed = 0;
    let x = setInterval(function() {
        cups_shuffle();
        elapsed++;

        if(elapsed == times) {
            // done
            clearInterval(x);

            // remove the class we added earlier
            $(".cup").forEach(cup => {
                cup.classList.remove("shuffling")
            })
        }
    }, 700)
}

/*
=======
reveal cups
=======
*/
$(".cup").forEach(cup => {
    cup.addEventListener("click", () => {
        if(cup.classList.contains("shuffling")) return;
        cup.style.top = "-50px";

        if(!cup.querySelector("button")) {
            // wrong cup
            alert("Wrong cup. Try again.")
            setTimeout(function() {
                location.reload();
            }, 1000)
        } else {
            $("button").style.bottom = "-30px"
            $("button").classList.remove("fadeout")
        }


        setTimeout(function() {
            cup.style.top = "0px";
            $("button").style.bottom = "0px"
            $("button").classList.add("fadeout")
        }, 2500)
    })
})

/*
=======
delete account button react
=======
*/
$("button").addEventListener("click", () => {
    if(document.querySelector(".cup.shuffling")) return;

    alert("Thank you for submitting your request.")
    setTimeout(function() {
        $(".cups_container").classList.add("hide")
    }, 2500)
})

/*
=======
start shuffle_loop
=======
*/
setTimeout(function() {
    shuffle_loop(Math.floor(Math.random() * 10) + 4)
}, 250)