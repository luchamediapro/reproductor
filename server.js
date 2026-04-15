const express = require("express");
const axios = require("axios");

const app = express();

const headers = {
    "User-Agent": "Mozilla/5.0"
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

            // NO tocar comentarios
            if (line.startsWith("#") || line === "") return line;

            // SOLO archivos .ts o .m3u8
            if (line.includes(".ts") || line.includes(".m3u8")) {

                // si ya es absoluta, dejarla
                if (line.startsWith("http")) return line;

                return base + line;
            }

            return line;

        }).join("\n");

        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.send(newPlaylist);

    } catch (e) {
        console.log(e.message);
        res.status(500).send("Error");
    }

});

app.listen(3000, () => {
    console.log("Proxy FIX VLC listo");
});
