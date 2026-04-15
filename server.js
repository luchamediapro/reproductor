const express = require("express");
const axios = require("axios");

const app = express();

app.get("/stream", async (req, res) => {

    const url = req.query.url;
    if (!url) return res.send("Falta URL");

    try {

        const response = await axios.get(url, {
            responseType: "text",
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": url
            }
        });

        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.setHeader("Access-Control-Allow-Origin", "*");

        // 🔥 NO modificar nada
        res.send(response.data);

    } catch (e) {
        console.log(e.message);
        res.status(500).send("Error");
    }

});

app.listen(3000, () => {
    console.log("Proxy simple activo");
});
