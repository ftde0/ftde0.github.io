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
let moveQueue = []
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
            moveQueue.push(-10)
            direction = -10;
            break;
        }
        case "arrowdown":
        case "s": {
            // go down if we're not going up
            if(direction == -10) return;
            moveQueue.push(10)
            direction = 10;
            break;
        }
        case "arrowleft":
        case "a": {
            // go left if we're not going right
            if(direction == 1) return;
            moveQueue.push(-1)
            direction = -1;
            break;
        }
        case "arrowright":
        case "d": {
            // go right if we're not going left
            if(direction == -1) return;
            moveQueue.push(1)
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
    snakePositions.push(snakePositions[snakePositions.length - 1] + (moveQueue[0] || direction));
    moveQueue.shift()

    // check if an apple is hit
    let snakeHead = snakePositions[snakePositions.length - 1]
    if(snakeHead == applePosition) {
        $(".grid_part")[applePosition].innerHTML = ""
        let oldApplePos = applePosition
        while(oldApplePos == applePosition || snakePositions.includes(applePosition)) {
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
    // 3rd check - down
    // 4th check - up
    console.log(Math.floor(snakeHead / 10 % 10))
    if((direction == -1 && snakeHead % 10 == 9) ||
        (direction == 1 && snakeHead % 10 == 0) || 
        (direction == 10 && Math.floor(snakeHead / 10 % 10) == 0) ||
        (direction == -10 && Math.floor(snakeHead / 10 % 10) == -1)) {
        
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
Touch swiping
========
*/
let touchX = []
let touchY = []
document.addEventListener("touchstart", (e) => {
    touchX = [e.touches[0].clientX]
    touchY = [e.touches[0].clientY]
})
document.addEventListener("touchend", (e) => {
    let resultKey = ""
    touchX.push(e.changedTouches[0].clientX)
    touchY.push(e.changedTouches[0].clientY)
    // find what direction the touch was made in (horizontally/vertically)
    let xAxis = false;

    if(Math.abs(touchX[0] - touchX[1]) > Math.abs(touchY[0] - touchY[1])) {xAxis = true;}

    // go left/right?
    if(xAxis && touchX[0] > touchX[1]) {
        // left
        resultKey = "ArrowLeft"
    } else if(xAxis && touchX[0] < touchX[1]) {
        // right
        resultKey = "ArrowRight"
    }

    // go up/down?
    if(!xAxis && touchY[0] > touchY[1]) {
        // up
        resultKey = "ArrowUp"
    } else if(!xAxis && touchY[0] < touchY[1]) {
        // down
        resultKey = "ArrowDown"
    }



    document.dispatchEvent(new KeyboardEvent("keydown", {key: resultKey}))
})