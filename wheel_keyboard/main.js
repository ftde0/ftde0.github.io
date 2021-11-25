const characters = ["A","Á","Ă","Ắ","Ặ","Ằ","Ẳ","Ẵ","Ǎ","Â","Ấ","Ậ","Ầ","Ẩ","Ẫ","Ä","Ạ","À","Ả","Ā","Ą","Å","Ǻ","Ã","Æ","Ǽ","B","Ḅ","Ɓ","ʚ","ɞ","C","Ć","Č","Ç","Ĉ","Ċ","Ɔ","ʗ","D","Ď","Ḓ","Ḍ","Ɗ","Ḏ","ǲ","ǅ","Đ","Ð","Ǳ","Ǆ","E","É","Ĕ","Ě","Ê","Ế","Ệ","Ề","Ể","Ễ","Ë","Ė","Ẹ","È","Ẻ","Ē","Ę","Ẽ","Ɛ","Ə","F","Ƒ","G","Ǵ","Ğ","Ǧ","Ģ","Ĝ","Ġ","Ḡ","ʛ","H","Ḫ","Ĥ","Ḥ","Ħ","I","Í","Ĭ","Ǐ","Î","Ï","İ","Ị","Ì","Ỉ","Ī","Į","Ĩ","Ĳ","J","Ĵ","K","Ķ","Ḳ","Ƙ","Ḵ","L","Ĺ","Ƚ","Ľ","Ļ","Ḽ","Ḷ","Ḹ","Ḻ","Ŀ","ǈ","Ł","Ǉ","M","Ḿ","Ṁ","Ṃ","N","Ń","Ň","Ņ","Ṋ","Ṅ","Ṇ","Ǹ","Ɲ","Ṉ","ǋ","Ñ","Ǌ","O","Ó","Ŏ","Ǒ","Ô","Ố","Ộ","Ồ","Ổ","Ỗ","Ö","Ọ","Ő","Ò","Ỏ","Ơ","Ớ","Ợ","Ờ","Ở","Ỡ","Ō","Ɵ","Ǫ","Ø","Ǿ","Õ","Œ","ɶ","P","Þ","Q","R","Ŕ","Ř","Ŗ","Ṙ","Ṛ","Ṝ","Ṟ","ʁ","S","Ś","Š","Ş","Ŝ","Ș","Ṡ","Ṣ","ẞ","T","Ť","Ţ","Ṱ","Ț","Ṭ","Ṯ","Ŧ","Þ","Ð","U","Ú","Ŭ","Ǔ","Û","Ü","Ǘ","Ǚ","Ǜ","Ǖ","Ụ","Ű","Ù","Ủ","Ư","Ứ","Ự","Ừ","Ử","Ữ","Ū","Ų","Ů","Ũ","V","W","Ẃ","Ŵ","Ẅ","Ẁ","ʬ","X","Y","Ý","Ŷ","Ÿ","Ẏ","Ỵ","Ỳ","Ƴ","Ỷ","Ȳ","Ỹ","Z","Ź","Ž","Ż","Ẓ","Ẕ","Ƶ", "-", "@", "."]
let charIndex = 0;
let offsets = []
let focus;
let dbc = false;


// couldn't be me without this code
// like it's really useful
// i don't have to querySelectorAll all the time
function $(element) {
    if(document.querySelectorAll(element).length !== 1) {
        return document.querySelectorAll(element);
    } else {
        return document.querySelector(element)
    }
}

// bring the wheel up when trying to type
$(".text").forEach(input => {
    input.addEventListener("keydown", (e) => {
        e.preventDefault();
    })
    input.addEventListener("click", function() {
        wheelBringup();
        focus = input;
    })
})

// sign up button - a single thank you
$("button").addEventListener("click", () => {
    if(
        $(".username").value &&
        $(".email").value &&
        $(".password").value
    ) {
        alert("Thank you for your information.")
    }
})


// remove the wheel when clicked anywhere else
document.addEventListener("click", (e) => {
    if(!e.path.includes($(".center"))
    && !e.path.includes($(".keyboard"))
    ) {
        $(".keyboard").style.bottom = "-60%";
    }
})

// wheel mechanics
function wheelBringup() {
    $(".keyboard").style.bottom = "0px"
}

$(".wheel").addEventListener("mousemove", (e) => {
    if(e.buttons == 1 && !dbc) {
        dbc = true;
        setTimeout(function() {
            dbc = false;
        }, 50)

        // check the direction
        offsets.push(e.offsetX)

        if(offsets.length > 5) {


            if(offsets[0] > offsets[4]) {
                // go left (index - 1)
                charIndex--;

                if(charIndex < 0) {
                    charIndex = characters.length - 1
                }
            } else {
                // go right (index + 1)
                charIndex++;

                if(charIndex > characters.length - 1) {
                    charIndex = 0
                }
            }

            $(".keyboard h1").innerHTML = characters[charIndex]
        }
    }
})

$(".wheel").addEventListener("touchmove", (e) => {
    $(".wheel").dispatchEvent(new MouseEvent("mousemove", {buttons: 1, offsetX: e.changedTouches[0].pageX, offsetY: e.changedTouches[0].pageY}))
})

$(".wheel").addEventListener("touchend", () => {
    offsets = []
})

$(".wheel").addEventListener("mouseup", () => {
    offsets = []
})

$(".wheel-inner").addEventListener("click", () => {
    focus.value += characters[charIndex]
})