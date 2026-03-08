const express = require("express");
const axios = require("axios");

const app = express();

const BASE = "http://38.49.128.38:8000/play/";

const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept": "*/*",
    "Connection": "keep-alive",
    "Referer": "http://38.49.128.38:8000/",
    "Origin": "http://38.49.128.38:8000"
};

app.get("/stream/:canal", async (req,res)=>{

    const canal = req.params.canal;
    const file = req.query.file || "index.m3u8";

    const url = `${BASE}${canal}/${file}`;

    try{

        // PLAYLIST
        if(file.includes(".m3u8")){

            const response = await axios.get(url,{
                headers: headers,
                timeout: 15000
            });

            let playlist = response.data;

            const refresh = Math.floor(Date.now()/10000);

            const lines = playlist.split("\n");

            const newPlaylist = lines.map(line=>{

                line = line.trim();

                if(line.endsWith(".ts") || line.endsWith(".m3u8")){
                    return `/stream/${canal}?file=${line}&t=${refresh}`;
                }

                return line;

            }).join("\n");

            res.setHeader("Content-Type","application/vnd.apple.mpegurl");
            res.setHeader("Cache-Control","no-cache");

            res.send(newPlaylist);

        }

        // SEGMENTOS VIDEO
        else{

            const stream = await axios({
                url:url,
                method:"GET",
                responseType:"stream",
                headers: headers,
                timeout: 20000
            });

            res.setHeader("Content-Type","video/mp2t");

            stream.data.pipe(res);

        }

    }catch(e){

        console.log("ERROR STREAM:", e.message);

        res.status(500).send("Error cargando stream");

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log("Proxy IPTV activo");
});
