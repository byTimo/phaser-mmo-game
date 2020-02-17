const path = require("path");
const jsdom = require("jsdom");
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io").listen(server);
const { JSDOM } = jsdom;

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
})

async function setupAuthoritativePhaser() {
    const dom = await JSDOM.fromFile(path.join(__dirname, "authoritative_server/index.html"), {
        runScripts: "dangerously",
        resources: "usable",
        pretendToBeVisual: true,
    });
    try {
        dom.window.gameLoaded = () => {
            server.listen(8080, function () {
                console.log("Start listening on " + server.address().port);
            })
        }
        dom.window.io = io;
    } catch (error) {
        console.error(error.message);
    }
}
setupAuthoritativePhaser();
