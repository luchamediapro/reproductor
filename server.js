const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

const VIDEO_PASSWORD = "secreta"; // Cambia esta contraseña por una más segura si lo deseas
const VIDEO_URL = "https://luchamedia.es/risas/rojo310325p1.mp4"; // URL del video alojado externamente

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

  if (!range) {
    res.status(400).send("Se requiere rango.");
    return;
  }

  try {
    // Obtiene las cabeceras del video
    const videoStats = await fetch(VIDEO_URL);
    const videoSize = videoStats.headers.get('content-length');

    // Define el tamaño de los fragmentos (1MB por fragmento)
    const CHUNK_SIZE = 1 * 1024 * 1024;  // 1 MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Solicita solo el fragmento del video correspondiente
    const videoResponse = await fetch(VIDEO_URL, {
      headers: { Range: `bytes=${start}-${end}` }
    });

    if (!videoResponse.ok) throw new Error("No se pudo acceder al video");

    // Define las cabeceras para el streaming
    res.status(206);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Range', `bytes ${start}-${end}/${videoSize}`);
    res.setHeader('Accept-Ranges', 'bytes');

    // Transmite el fragmento del video al cliente
    videoResponse.body.pipe(res);
  } catch (err) {
    res.status(500).send("Error al acceder al video.");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
