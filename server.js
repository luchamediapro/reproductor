const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

async function getStream(){

const browser = await puppeteer.launch({
headless:true,
args:["--no-sandbox","--disable-setuid-sandbox"]
});

const page = await browser.newPage();

let stream = null;

page.on("request", req => {

const url = req.url();

if(url.includes("okcdn.ru") && url.includes("manifest.mpd")){
stream = url;
}

});

await page.goto("https://live.vkvideo.ru/app/embed/luchamedia");

await new Promise(r => setTimeout(r,8000));

await browser.close();

return stream;

}

app.get("/stream", async (req,res)=>{

const stream = await getStream();

if(stream){
res.send(stream);
}else{
res.send("STREAM NO ENCONTRADO");
}

});

app.listen(3000,()=>{
console.log("server iniciado");
});
