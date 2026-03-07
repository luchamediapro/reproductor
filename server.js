const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

async function getStream(){

try{

const browser = await puppeteer.launch({
headless: "new",
args: [
"--no-sandbox",
"--disable-setuid-sandbox",
"--disable-dev-shm-usage"
]
});

const page = await browser.newPage();

let stream = null;

page.on("request", req => {

const url = req.url();

if(url.includes("okcdn.ru") && url.includes("manifest.mpd")){
stream = url;
}

});

await page.goto("https://live.vkvideo.ru/app/embed/luchamedia",{
waitUntil:"networkidle2",
timeout:30000
});

await new Promise(r=>setTimeout(r,5000));

await browser.close();

return stream;

}catch(e){

return "ERROR: " + e.message;

}

}

app.get("/", (req,res)=>{
res.send("Extractor VK funcionando");
});

app.get("/stream", async (req,res)=>{

const stream = await getStream();

res.send(stream || "STREAM NO ENCONTRADO");

});

app.listen(3000,()=>{
console.log("Servidor iniciado");
});
