require("dotenv").config()

var request = require("request")
var keys = require("./keys.js")
var Spotify = require("node-spotify-api")
var moment = require("moment")
var fs = require("fs")

var spotify = new Spotify(keys.spotify);

var command = process.argv[2]
var term = process.argv.splice(3).join(" ")

// console.log("command: " + command)
// console.log("term: '" + term + "'")
console.log("\n")

cmdSwitch() // initial run

function cmdSwitch() {
    switch (command) {
        case "concert-this":
            concertSearch()
            break

        case "spotify-this-song":
            spotifySearch()
            break

        case "movie-this":
            omdbSearch()
            break

        case "do-what-it-says":
            fs.readFile('random.txt', 'utf8', function (err, data) {
                if (err) {
                    return console.log(err);
                }
                var dataArr = data.split(',')
                command = dataArr[0]
                term = dataArr[1]
                cmdSwitch()
            })
    }
}

function concertSearch() {
    var queryUrl = "https://rest.bandsintown.com/artists/" + term + "/events?app_id=codingbootcamp"
    // console.log(queryUrl)

    request(queryUrl, function (error, response, body) {
        if (!error && response.statusCode === 200) {

            var events = JSON.parse(body)
            for (let i = 0; i < events.length; i++) {

                let region = ""
                if (events[i].venue.region != "") {
                    region = events[i].venue.region + ", "
                }

                console.log("Venue: " + events[i].venue.name)
                console.log("Location: " + events[i].venue.city + ", " + region + events[i].venue.country)
                console.log("Date: " + moment(events[i].datetime.split("T")[0], 'YYYY-MM-DD').format("MM/DD/YYYY"))
                console.log("\n")
            }
        }
    })
}

function spotifySearch() {
    spotify.search({ type: 'track', query: term }, function (err, data) {
        if (err) {
            // console.log('Error occurred')
            term = "The Sign"
            spotifySearch()
        } else {
            var flag = false
            var i = 0
            var res
            // finds matching song name or uses first result if match not found
            while (!flag) {
                if (i < data.tracks.items.length) {
                    if (data.tracks.items[i].name.toLowerCase() === term.toLowerCase()) {
                        flag = true
                        res = data.tracks.items[i]
                        // console.log("WORKED")
                    }
                } else {
                    flag = true
                    res = data.tracks.items[0]
                    // console.log("FAILED")
                }
                i++
            }

            console.log("Artist(s): " + artists());
            console.log("Song: " + res.name);
            console.log("Album: " + res.album.name)
            console.log("Sample: " + res.external_urls.spotify)
            console.log("\n")
            // console.log(data.tracks.items)

            function artists() {
                let list = []
                for (let i = 0; i < res.album.artists.length; i++) {
                    list.push(res.album.artists[i].name)
                }
                list = list.join(", ")
                return list
            }
        }
    });
}

function omdbSearch() {
    var queryUrl = "http://www.omdbapi.com/?t=" + term + "&y=&plot=short&apikey=trilogy"
    // console.log(queryUrl)

    request(queryUrl, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log("Title: " + JSON.parse(body).Title)
            console.log("Release Year: " + JSON.parse(body).Year)
            console.log("IMDB Rating: " + JSON.parse(body).Ratings[0].Value)
            console.log("Rotten Tomatoes Rating: " + JSON.parse(body).Ratings[1].Value)
            console.log("Produced in: " + JSON.parse(body).Country)
            console.log("Language(s): " + JSON.parse(body).Language)
            console.log("Actors: " + JSON.parse(body).Actors)
            console.log("Plot: " + JSON.parse(body).Plot)
            console.log("\n")
        }
    })
}