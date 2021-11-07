const numFormat = "(===) ===-===="
const numLength = 10;
const player = $(".player")
let gameAreaWidth = $(".main-game").getBoundingClientRect().width
let gameAreaTop = $(".main-game").getBoundingClientRect().top
let points = 0;
let playerPos = 50; //%
let debounce = false; // for shooting, minimal

function $(element) {
    if(document.querySelectorAll(element).length !== 1) {
        return document.querySelectorAll(element);
    } else {
        return document.querySelector(element)
    }
}

function formatNumber() {
    // Format points to the phone number
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
function replace_rnd(pattern, property) {
    pattern[property] = Math.floor(Math.random() * 100) + "%"
    return pattern;
}





// Keys
document.addEventListener("keydown", (e) => {
    switch(e.key) {
        case "z": {
            // create a bullet
            if(!debounce) {
                let bullet = document.createElement("span")
                bullet.className = "bullet"
                if(playerPos > 5) {
                    bullet.style.left = playerPos + "%"
                    setTimeout(function() {
                        // remove when the animation is done
                        bullet.remove();
                    }, 1850)
        
                    $(".main-game").appendChild(bullet)



                    debounce = true;
                    setTimeout(function() {
                        debounce = false;
                    }, 100)
                }
            
            }
        }
    }
})

// Mouse movement
$(".main-game").addEventListener("mousemove", (e) => {
    playerPos = Math.floor((e.offsetX / gameAreaWidth) * 100)
    if(e.offsetX > 50) {
        player.style.left = playerPos + "%"
    }
})


// Mark as done
document.addEventListener("dblclick", () => {
    if(confirm("Your number appears to be: " + formatNumber() + "\nIs that correct?")) {
        // yes
        alert("Thank you!")

        clearInterval(bulletSpawn);
        clearInterval(bulletTrack)
    }
})


// Touchscreen
let zEvent = new KeyboardEvent("keydown", {"key": "z"})
$(".main-game").addEventListener("touchmove", (e) => {
    playerPos = Math.floor(((e.touches.item(0).pageX - $(".main-game").getBoundingClientRect().left) / gameAreaWidth) * 100)
    player.style.left = playerPos + "%"

    // auto-dispatch the bullet event
    document.dispatchEvent(zEvent)
})

$(".right-section").addEventListener("touchstart", () => {
    // done
    document.dispatchEvent(new Event("dblclick"))
})


// Resize adjustments
window.addEventListener("resize", () => {
    gameAreaWidth = $(".main-game").getBoundingClientRect().width
    gameAreaTop = $(".main-game").getBoundingClientRect().top
})







// Gameplay



// Create a stream of bullets
let bulletSpawn = setInterval(() => {
    let left = Math.floor(Math.random() * 100)

    let bullet = document.createElement("span")
    bullet.className = "enemy_bullet"
    bullet.style.left = left + "%"

    $(".main-game").appendChild(bullet)

    setTimeout(function() {
        bullet.style.top = "100%"
    }, 100)

    setTimeout(function() {
        bullet.remove();
    }, 3250)
}, 50)


// Index all bullets' positions
let bulletTrack = setInterval(() => {
    let enemyPositions = []
    let selfPositions = []
    let playerData = {"e": player, "ta": player.getBoundingClientRect().top, "la": player.getBoundingClientRect().left}

    // fill both arrays


    /*
    e: element
    t: top
    l: left
    ta: top absolute
    la: left absolute
    */ 
    $(".enemy_bullet").forEach(enb => {
        enemyPositions.push({"e": enb,
                            "t": (enb.getBoundingClientRect().top - gameAreaTop),
                            "l": parseInt(enb.style.left),
                            "ta": enb.getBoundingClientRect().top,
                            "la": enb.getBoundingClientRect().left});
    })
    document.querySelectorAll(".bullet").forEach(b => {
        selfPositions.push({"e": b,
                            "t": (b.getBoundingClientRect().top - gameAreaTop),
                            "l": parseInt(b.style.left)})
    })


    // check if they match
    enemyPositions.forEach(enemy => {

        // touching a bullet?
        selfPositions.forEach(shot => {
            if(enemy.t - 40 <= shot.t
                && enemy.t + 40 >= shot.t
                && enemy.l - 5 <= shot.l
                && enemy.l + 5 >= shot.l) {
                    shot.e.remove();
                    enemy.e.remove();
                    points++;
                    $(".points").innerHTML = formatNumber();
            }
        })



        // touching the player?
        if(enemy.la - 10 <= playerData.la
            && enemy.la + 10 >= playerData.la
            && enemy.ta <= playerData.ta
            && enemy.ta + 20 >= playerData.ta) {
                setTimeout(() => {
                    alert("Unfortunate. We may need you to start over.")
                    points = 0;
                    $(".points").innerHTML = formatNumber();
                }, 100)
            }

    })
}, 200)