const express = require("express");
const axios = require("axios");

const app = express();

const CHANNEL = "luchamedia";

async function getStream(){

try{

const api = `https://live.vkvideo.ru/api/v1/blog/${CHANNEL}/live`;

const r = await axios.get(api,{
headers:{
"User-Agent":"Mozilla/5.0",
"Referer":"https://live.vkvideo.ru/"
}
});

if(r.data && r.data.live && r.data.live.playback_url){
return r.data.live.playback_url;
}

return null;

}catch(e){
return null;
}

}

app.get("/stream", async (req,res)=>{

const stream = await getStream();

if(stream){
res.send(stream);
}else{
res.send("stream no disponible");
}

});

app.listen(3000,()=>{
console.log("server iniciado");
});
