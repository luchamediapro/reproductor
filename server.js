const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

const VIDEO_PASSWORD = "secreta"; // Cambia esta contraseña por una más segura si lo deseas
const VIDEO_URL = "https://tuhost.com/privado/video.mp4"; // URL del video alojado externamente

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send(`
    <form method="POST" action="/video">
      <input type="password" name="pass" placeholder="Contraseña" />
      <button type="submit">Ver video</button>
    </form>
  `);
});

app.post('/video', (req, res) => {
  if (req.body.pass === VIDEO_PASSWORD) {
    // Redirige a una página con el reproductor embed (iframe)
    res.send(`
      <h2>Video protegido</h2>
      <iframe src="/secure-video" width="640" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
    `);
  } else {
    res.send('Contraseña incorrecta');
  }
});

// Este es el endpoint que sirve el video en fragmentos
app.get('/secure-video', async (req, res) => {
  const range = req.headers.range;
  
  try {
    // Si no hay rango en la solicitud, devolvemos el video completo
    if (!range) {
      return fetchAndSendFullVideo(res);
    }

    // Obtener tamaño del video y calcular los fragmentos
    const videoStats = await fetch(VIDEO_URL);
    const videoSize = videoStats.headers.get('content-length');
    
    // Definir tamaño de fragmentos (1MB)
    const CHUNK_SIZE = 1 * 1024 * 1024; // 1 MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    const videoResponse = await fetch(VIDEO_URL, {
      headers: { Range: `bytes=${start}-${end}` }
    });

    if (!videoResponse.ok) throw new Error("No se pudo acceder al video");

    res.status(206);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Range', `bytes ${start}-${end}/${videoSize}`);
    res.setHeader('Accept-Ranges', 'bytes');

    videoResponse.body.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al acceder al video.");
  }
});

// Función para servir el video completo
async function fetchAndSendFullVideo(res) {
  try {
    const videoResponse = await fetch(VIDEO_URL);
    if (!videoResponse.ok) throw new Error("No se pudo acceder al video");

    res.status(200);
    res.setHeader('Content-Type', 'video/mp4');
    videoResponse.body.pipe(res);
  } catch (err) {
    res.status(500).send("Error al acceder al video.");
  }
}

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
