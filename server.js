const express = require("express");
const axios = require("axios");

const app = express();

const BASE = "http://38.49.128.38:8000";

app.get("/stream/:canal", async (req, res) => {

    const canal = req.params.canal;
    const file = req.query.file || "index.m3u8";

    const url = `${BASE}/play/${canal}/${file}`;

    try {

        if (file.endsWith(".m3u8")) {

            const response = await axios.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    "Accept": "*/*",
                    "Connection": "keep-alive",
                    "Referer": `${BASE}/`
                },
                timeout: 10000
            });

            let playlist = response.data;

            const refresh = Math.floor(Date.now()/10000);

            playlist = playlist.replace(/(.*\.ts)/g, (seg) => {
                return `/stream/${canal}?file=${seg}&r=${refresh}`;
            });

            res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
            res.setHeader("Cache-Control", "no-cache");

            res.send(playlist);

        } else {

            const stream = await axios({
                url: url,
                method: "GET",
                responseType: "stream",
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Referer": `${BASE}/`
                }
            });

            res.setHeader("Content-Type", "video/mp2t");

            stream.data.pipe(res);

        }

    } catch (error) {

        console.log("ERROR:", error.message);

        res.status(500).send("Error cargando stream");

    }

});

app.listen(process.env.PORT || 3000, () => {
    console.log("Proxy HLS activo");
});
