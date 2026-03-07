const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

async function getStream() {

try {

const embed = await axios.get(
"https://live.vkvideo.ru/app/embed/luchamedia",
{headers:{ "User-Agent":"Mozilla/5.0"}}
);

const html = embed.data;

/* buscar id del stream */

const idMatch = html.match(/"broadcast_id":"(\d+)"/);

if(!idMatch){
return null;
}

const broadcastId = idMatch[1];

/* consultar info del stream */

const api = await axios.get(
`https://live.vkvideo.ru/api/v1/broadcast/${broadcastId}`,
{headers:{ "User-Agent":"Mozilla/5.0"}}
);

if(api.data && api.data.playback_url){
return api.data.playback_url;
}

return null;

}catch(e){

return "ERROR: "+e.message;

}

}

app.get("/",(req,res)=>{
res.send("Extractor VK funcionando");
});

app.get("/stream", async (req,res)=>{

const stream = await getStream();

res.send(stream || "STREAM NO DISPONIBLE");

});

app.listen(PORT,()=>{
console.log("Servidor iniciado");
});
