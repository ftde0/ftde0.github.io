function $(element) {
    if(document.querySelectorAll(element).length !== 1) {
        return document.querySelectorAll(element);
    } else {
        return document.querySelector(element)
    }
}
let snakePositions = [0, 1, 2]
let applePosition = Math.floor(Math.random() * 100)
let applePrice = ["-3", "-2", "-1", "1", "2"][Math.floor(Math.random() * 5)]
let score = 0;
let direction = 1 /*

directions:
1 == right
-1 == left
-10 == top
10 == bottom

*/
$(".game-space").innerHTML = `<span class="grid_part"></span>`.repeat(100);


/*
========
Key events
========
*/
document.addEventListener("keydown", (e) => {
    console.log(direction)
    switch(e.key.toLowerCase()) {
        case "arrowup":
        case "w": {
            // go up if we're not going down
            if(direction == 10) return;
            direction = -10;
            break;
        }
        case "arrowdown":
        case "s": {
            // go down if we're not going up
            if(direction == -10) return;
            direction = 10;
            break;
        }
        case "arrowleft":
        case "a": {
            // go left if we're not going right
            if(direction == 1) return;
            direction = -1;
            break;
        }
        case "arrowright":
        case "d": {
            // go right if we're not going left
            if(direction == -1) return;
            direction = 1;
            break;
        }
    }
})

/*
========
Render the game
========
*/
function gameRender() {
   $(".grid_part").forEach(g => {g.removeAttribute("style")})

    // snake
    snakePositions.forEach(position => {
        try {
            $(".grid_part")[position].style.outline = "1px #cbcbcb solid"
            $(".grid_part")[position].style.backgroundColor = "greenyellow"
        }
        catch(error) {}
    })
    // apple
    $(".grid_part")[applePosition].innerHTML = applePrice;
}

/*
========
Snake movement & mechanics
========
*/
let movement = setInterval(function() {
    snakePositions.shift()
    snakePositions.push(snakePositions[snakePositions.length - 1] + direction);

    // check if an apple is hit
    let snakeHead = snakePositions[snakePositions.length - 1]
    if(snakeHead == applePosition) {
        $(".grid_part")[applePosition].innerHTML = ""
        let oldApplePos = applePosition
        while(oldApplePos == applePosition) {
            applePosition = Math.floor(Math.random() * 100)
        }
        let c = 0;
        while(c !== Math.abs(parseInt(applePrice))) {
            snakePositions.unshift(snakePositions[0] - direction)
            c++;
        }


        score += parseInt(applePrice);
        applePrice = ["-3", "-2", "-1", "1", "2", "10"][Math.floor(Math.random() * 6)]
        $("h1").innerHTML = `You are ${score} years old.`
    }

    // check if a wall is hit
    // 1st check - left
    // 2nd check - right
    // 3rd check - up & down
    if((direction == -1 && snakeHead % 10 == 9) ||
        (direction == 1 && snakeHead % 10 == 0) || 
        (direction == 10 && Math.floor(snakeHead / 10 % 10) == 0)) {
        
        gameEnd();
    }

    // check if our head hits ourselves
    let times = 0;
    snakePositions.forEach(position => {
        if(position == snakeHead) {
            times++;
        }
    })
    if(times >= 2) {
        // bonk
        gameEnd();
    }

    // render
    gameRender();
}, 250)

/*
========
Game finishing
========
*/
function gameEnd() {
    clearInterval(movement);
    $("h3").innerHTML = `Thank you for submitting!`
    $(".game-space").style.opacity = 0;
}

/*
========
Touch buttons
========
*/
$(".control_buttons button").forEach(button => {
    button.addEventListener("click", (e) => {
        document.dispatchEvent(new KeyboardEvent("keydown", {key: button.getAttribute("data-key")}))
    })
})