const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

async function getStream() {

try {

const url = "https://live.vkvideo.ru/app/embed/luchamedia";

const r = await axios.get(url,{
headers:{
"User-Agent":"Mozilla/5.0"
}
});

const html = r.data;

/* buscar url okcdn */

const match = html.match(/https:\/\/[^"]+okcdn\.ru[^"]+manifest\.mpd[^"]*/);

if(match){
return match[0];
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

res.send(stream || "STREAM NO ENCONTRADO");

});

app.listen(PORT,()=>{
console.log("Servidor iniciado");
});
