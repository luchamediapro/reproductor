const express = require("express");
const axios = require("axios");

const app = express();

const BASE = "http://45.225.68.1:8532/Live/878e0987f8fffce401028e0283b0b24d/";

app.get("/", (req,res)=>{
    res.send("Proxy HLS funcionando");
});

app.get("/stream", async (req,res)=>{

    const file = req.query.file || "local-ch30.playlist.m3u8";
    const url = BASE + file;

    try{

        // PLAYLIST
        if(file.includes(".m3u8")){

            const response = await axios.get(url,{
                headers:{
                    "User-Agent":"Mozilla/5.0"
                }
            });

            let playlist = response.data;

            const lines = playlist.split("\n");

            const newPlaylist = lines.map(line => {

                line = line.trim();

                if(line.endsWith(".m3u8") || line.endsWith(".ts")){
                    return "/stream?file=" + line;
                }

                return line;

            }).join("\n");

            res.setHeader("Content-Type","application/vnd.apple.mpegurl");

            res.send(newPlaylist);

        }

        // SEGMENTOS VIDEO
        else{

            const stream = await axios({
                url:url,
                method:"GET",
                responseType:"stream",
                headers:{
                    "User-Agent":"Mozilla/5.0"
                }
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
    console.log("Servidor iniciado");
});
