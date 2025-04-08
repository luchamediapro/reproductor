// server.js
const express = require('express');
const fetch = require('node-fetch'); // Instalar: npm install node-fetch
const app = express();
const PORT = process.env.PORT || 3000;

const VIDEO_PASSWORD = "secreta";
const VIDEO_URL = "https://luchamedia.es/risas/rojo310325p1.mp4";

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
    res.send(`
      <h2>Video protegido</h2>
      <video width="640" height="360" controls>
        <source src="/secure-video" type="video/mp4">
      </video>
    `);
  } else {
    res.send('Contraseña incorrecta');
  }
});

app.get('/secure-video', async (req, res) => {
  // Aquí deberías agregar verificación de sesión o token real
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
