import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 5173;

const app = express();

app.use(compression());

// Servir archivos estáticos
app.use(express.static(path.resolve(__dirname, 'dist')));

// SPA fallback - todas las rutas devuelven index.html
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
