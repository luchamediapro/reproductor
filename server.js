const express = require("express");
const axios = require("axios");

const app = express();

const headers = {
    "User-Agent": "Mozilla/5.0",
    "Accept": "*/*"
};

app.get("/stream", async (req, res) => {

    const url = req.query.url;

    if (!url) return res.send("Falta URL");

    try {

        const response = await axios.get(url, { headers });

        let playlist = response.data;

        const base = url.substring(0, url.lastIndexOf("/") + 1);

        const lines = playlist.split("\n");

        const newPlaylist = lines.map(line => {

            line = line.trim();

            // SOLO modifica sub-playlists, NO .ts
            if (line.endsWith(".m3u8")) {

                const absolute = line.startsWith("http")
                    ? line
                    : base + line;

                return `/stream?url=${encodeURIComponent(absolute)}`;
            }

            // .ts quedan directos → NO pasan por tu server
            return line;

        }).join("\n");

        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.send(newPlaylist);

    } catch (e) {
        res.status(500).send("Error");
    }

});

app.listen(3000, () => {
    console.log("Proxy ligero activo");
});
