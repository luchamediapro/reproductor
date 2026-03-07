const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

async function getStream() {
  try {

    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: puppeteer.executablePath(),
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

      if (url.includes("okcdn.ru") && url.includes("manifest.mpd")) {
        stream = url;
      }

    });

    await page.goto(
      "https://live.vkvideo.ru/app/embed/luchamedia",
      { waitUntil: "networkidle2", timeout: 30000 }
    );

    await new Promise(r => setTimeout(r, 6000));

    await browser.close();

    return stream;

  } catch (e) {

    return "ERROR: " + e.message;

  }
}

app.get("/", (req, res) => {
  res.send("Servidor extractor VK funcionando");
});

app.get("/stream", async (req, res) => {

  const stream = await getStream();

  if (stream) {
    res.send(stream);
  } else {
    res.send("STREAM NO ENCONTRADO");
  }

});

app.listen(PORT, () => {
  console.log("Servidor iniciado en puerto " + PORT);
});
