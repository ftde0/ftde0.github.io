function $(element) {
    if(document.querySelectorAll(element).length !== 1) {
        return document.querySelectorAll(element);
    } else {
        return document.querySelector(element)
    }
}
let numFormat = "(===) ===-===="
let numLength = 10;
let number = 0;
let wind = 0;
let markedAsDone = false;
let proxyHostname = "https://ftde-projects.tk:5930"

/*
=======
format phone number according to numFormat
=======
*/
function formatNumber() {
    let pts = Math.floor(number).toString()
    let newNumber = numFormat
    
    // add leading zeros
    while(pts.length < numLength) {
        pts = "0" + pts
    }

    // apply to numFormat
    pts.split("").forEach(num => {
        newNumber = newNumber.replace("=", num)
    })

    return newNumber;
}

/*
=======
fetch weather for city (string) - pass that to our proxy
=======
*/
function getWeather(city) {
    // using a set up server as a proxy (check readme.md for info how to selfhost)
    fetch(proxyHostname + "/wind", {
        "headers": {
            "city": encodeURIComponent(city),
            "imperial": $(".units").checked,
            "api_key": encodeURIComponent($(".api-key").value)
        }
    }).then(r => {
        r.json().then(response => {
            // data
            $(".display-city").innerHTML = city
            $(".wind").innerHTML = `Wind speed: ${response.speed}`


            // wait, something went wrong!!
            if(!response.speed) {
                $(".alert-box .content").innerHTML = "<h2>Something didn't go right. More info might be below.</h2>"
                $(".alert-box").classList.add("connection-error")
                $(".alert-box").style.display = "block"

                $(".alert-box .content").innerHTML += "<br><p>" + (response.message || "unknown error??") + "</p>"
                return;
            }


            // units
            if($(".units").checked) {
                $(".wind").innerHTML += "mph"
            } else {
                $(".wind").innerHTML += "m/s"
            }


            wind = response.speed
            $(".wind").innerHTML += "<br>Direction: "


            // direction
            if(response.deg > 169) {
                // west - add a "-"
                wind = -wind
                $(".wind").innerHTML += "🢀"
            } else {
                // east
                $(".wind").innerHTML += "🢂"
            }


            // suffix
            $(".wind").innerHTML += "<br>ENTER/Touch once the slider gets to your number."
        })
    }).catch(error => {
        $(".alert-box .content").innerHTML = "<h2>Couldn't connect. Did you set up the server correctly?</h2>"
        console.log(error)
        $(".alert-box").classList.add("connection-error")
        $(".alert-box").style.display = "block"
    })
}

/*
=======
range update (set the correct number on the slider)
=======
*/
function rangeUpdate() {
    $(`input[type="range"]`).value = number
    $(`.number-text`).innerHTML = formatNumber()
    $(`.number-text`).style.left = Math.floor(number / parseInt("9".repeat(numLength)) * 350 - 45) + "px"
}

/*
=======
range readonly
=======
*/
$(`input[type="range"]`).addEventListener("mousemove", () => {
    rangeUpdate()
})

/*
=======
ok button
=======
*/
$(".alert-box button").addEventListener("click", () => {
    $(".alert-box").style.display = "none"


    if($(".alert-box").classList.contains("initial")) {
        // city entry prompt
        $(".alert-box").classList.remove("initial")
        number = Math.floor(Math.random() * parseInt("9".repeat(numLength)))
        // custom number format
        if($(".number-format").value) {
            numFormat = $(".number-format").value;
            numLength = numFormat.replace(/[^=]/g, "").length
            $(`input[type="range"]`).setAttribute("max", "9".repeat(numLength))

        }
        rangeUpdate()
        getWeather($(".city-name").value)
    } else if($(".alert-box").classList.contains("connection-error")) {
        // bring back the entering box if we can't connect
        $(".alert-box").classList.add("initial")
        $(".alert-box").classList.remove("connection-error")
        $(".alert-box .content").innerHTML = `<h1>First things first...</h1>
                                            <input type="text" class="city-name" placeholder="City name"></input><br>
                                            <input type="text" class="api-key" placeholder="OpenWeatherMap API key (optional)"></input><br>
                                            <input type="text" class="number-format" placeholder="Phone number format (use = as a digit)"></input><br>
                                            <input type="checkbox" class="units" id="units"></input>
                                            <label for="units">Use imperial (mph)</label>`
        $(".alert-box").style.display = "block"
    }
})

/*
=======
number changing
=======
*/
let numberInterval = setInterval(function() {
    number += wind
    if(number <= 0 || number > parseInt("9".repeat(numLength))) {
        number = Math.floor(Math.random() * parseInt("9".repeat(numLength)))
    }
    rangeUpdate();
}, 1000)

/*
=======
enter/touch
=======
*/
function markDone() {
    if(confirm(`Your phone number appears to be ${formatNumber()}. Please confirm it is correct.`)) {
        // pressed ok
        alert("Thank you!")
        clearInterval(numberInterval)
        markedAsDone = true;
    }
}

document.addEventListener("keydown", (e) => {
    if(e.key.toLowerCase() == "enter" && wind !== 0 && !markedAsDone) {
        markDone();
    }
})

document.addEventListener("touchstart", () => {
    if(wind !== 0 && !markedAsDone) {
        markDone();
    }
})