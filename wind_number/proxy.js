const openweathermap_apikey = `aaaaaaaaaaa`
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
let timeouts = []

/*
=======
user timeout (30 seconds, mainly to not take down the api key)
=======
*/
function md5(input) {
    return crypto.createHash('md5').update(input).digest('hex');
}
function timeout(ip) {
    timeouts.push(md5(ip))
    setTimeout(function() {
        timeouts = timeouts.filter((s => s !== md5(ip)))
    }, 30000)
}

/*
=======
express stuff
=======
*/
const app = express();
app.use(cors())
app.listen(5930, () => {});

app.get('/wind', (req,res) => {
    /*
    =======
    make an appropriate request (and pass its response), or send a timeout notice
    =======
    */
    if(!timeouts.includes(md5(req.ip))) {
        let mode = "metric"
        if(JSON.parse(req.headers.imperial)) {
            mode = "imperial"
        }

        let url = "https://api.openweathermap.org/data/2.5/weather?q="+ req.headers.city + "&APPID=" + openweathermap_apikey + "&units=" + mode
        
        if(req.headers.api_key !== "") {
            url = "https://api.openweathermap.org/data/2.5/weather?q="+ req.headers.city + "&APPID=" + decodeURIComponent(req.headers.api_key) + "&units=" + mode
        }

        fetch(url)
        .then(r => {
            r.json().then(response => {
                // only timeout if we have correct data
                if(response.wind) {
                    timeout(req.ip)
                }
               
                // pass data
                res.send(response.wind || response)
            })
        })
    } else {
        res.send({"cod": 403, "message": "[proxy] timeout (try again after 30 seconds)"})
    }
})

/*
=======
no crashing
=======
*/
process.on("uncaughtException", function(ex) {
    console.log(ex.message)
})