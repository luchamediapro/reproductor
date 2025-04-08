// server.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

const VIDEO_PASSWORD = "secreta"; // Cambia esta contraseña por una más segura si lo deseas
const VIDEO_URL = "https://luchamedia.es/risas/rojo310325p1.mp4"; // La URL del video alojado externamente

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

app.get('/secure-video', async (req, res) => {
  // Aquí verificas la contraseña o el token, y luego sirves el video
  try {
    const videoResponse = await fetch(VIDEO_URL);
    if (!videoResponse.ok) throw new Error("No se pudo acceder al video");

    res.setHeader('Content-Type', 'video/mp4');
    videoResponse.body.pipe(res);
  } catch (err) {
    res.status(500).send("Error al acceder al video.");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
