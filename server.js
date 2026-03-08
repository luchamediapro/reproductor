const express = require("express");
const axios = require("axios");

const app = express();

const BASE = "http://38.49.128.38:8000/play/";

app.get("/", (req,res)=>{
    res.send("Proxy HLS activo");
});

app.get("/stream/:canal", async (req,res)=>{

    const canal = req.params.canal;
    const file = req.query.file || "index.m3u8";

    const url = `${BASE}${canal}/${file}`;

    try{

        // PLAYLIST
        if(file.includes(".m3u8")){

            const response = await axios.get(url,{
                headers:{ "User-Agent":"Mozilla/5.0" }
            });

            let playlist = response.data;

            const refresh = Math.floor(Date.now()/10000);

            const lines = playlist.split("\n");

            const newPlaylist = lines.map(line=>{

                line = line.trim();

                if(line.endsWith(".m3u8") || line.endsWith(".ts")){
                    return `/stream/${canal}?file=${line}&r=${refresh}`;
                }

                return line;

            }).join("\n");

            res.setHeader("Content-Type","application/vnd.apple.mpegurl");
            res.setHeader("Cache-Control","no-cache");

            res.send(newPlaylist);

        }

        // SEGMENTOS
        else{

            const stream = await axios({
                url:url,
                method:"GET",
                responseType:"stream",
                headers:{ "User-Agent":"Mozilla/5.0" }
            });

            res.setHeader("Content-Type","video/mp2t");

            stream.data.pipe(res);

        }

    }catch(e){

        console.log(e.message);
        res.status(500).send("Error cargando stream");

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{

    console.log("Proxy funcionando");

});
