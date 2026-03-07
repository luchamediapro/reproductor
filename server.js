const express = require("express");
const axios = require("axios");

const app = express();

const CHANNEL = "luchamedia";

async function getStream() {

try {

const url = `https://live.vkvideo.ru/api/v1/blog/${CHANNEL}/stream`;

const r = await axios.get(url,{
headers:{
"User-Agent":"Mozilla/5.0",
"Referer":"https://live.vkvideo.ru/"
}
});

if(r.data && r.data.stream && r.data.stream.playback_url){
return r.data.stream.playback_url;
}

return null;

}catch(e){
return null;
}

}

app.get("/", (req,res)=>{
res.send("Servidor funcionando");
});

app.get("/stream", async (req,res)=>{

const stream = await getStream();

if(stream){
res.send(stream);
}else{
res.send("STREAM NO DISPONIBLE");
}

});

app.listen(3000, ()=>{
console.log("Servidor iniciado");
});
