const express = require("express");
const axios = require("axios");

const app = express();

const BASE = "http://45.225.68.1:8532/Live/878e0987f8fffce401028e0283b0b24d/";

app.get("/stream", async (req, res) => {

    const file = req.query.file || "local-ch30.playlist.m3u8";
    const url = BASE + file;

    try {

        const response = await axios.get(url, {
            responseType: "text",
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": "http://45.225.68.1/"
            }
        });

        if (file.includes(".m3u8")) {

            let playlist = response.data;

            playlist = playlist.replace(/(.*\.ts)/g, (match) => {
                return "/stream?file=" + match;
            });

            res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
            res.send(playlist);

        } else {

            const stream = await axios({
                url: url,
                method: "GET",
                responseType: "stream"
            });

            res.setHeader("Content-Type", "video/mp2t");
            stream.data.pipe(res);

        }

    } catch (error) {
        res.status(500).send("Error cargando stream");
    }

});

app.listen(3000, () => {
    console.log("Proxy HLS activo");
});
