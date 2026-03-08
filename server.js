const express = require("express");
const axios = require("axios");

const app = express();

const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept": "*/*",
    "Connection": "keep-alive"
};

app.get("/stream", async (req,res)=>{

    const url = req.query.url;

    if(!url){
        return res.send("Falta URL");
    }

    try{

        if(url.includes(".m3u8")){

            const response = await axios.get(url,{ headers });

            let playlist = response.data;

            const base = url.substring(0, url.lastIndexOf("/") + 1);

            const refresh = Math.floor(Date.now()/10000);

            const lines = playlist.split("\n");

            const newPlaylist = lines.map(line=>{

                line = line.trim();

                if(line.endsWith(".ts") || line.endsWith(".m3u8")){

                    const absolute = line.startsWith("http")
                        ? line
                        : base + line;

                    return `/stream?url=${encodeURIComponent(absolute)}&t=${refresh}`;

                }

                return line;

            }).join("\n");

            res.setHeader("Content-Type","application/vnd.apple.mpegurl");
            res.setHeader("Cache-Control","no-cache");

            res.send(newPlaylist);

        } else {

            const stream = await axios({
                url:url,
                method:"GET",
                responseType:"stream",
                headers: headers
            });

            res.setHeader("Content-Type","video/mp2t");

            stream.data.pipe(res);

        }

    }catch(e){

        console.log("ERROR:", e.message);

        res.status(500).send("Error cargando stream");

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log("Proxy IPTV universal activo");
});
