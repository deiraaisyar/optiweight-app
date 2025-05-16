// filepath: backend/src/server.ts
import app from './app';

const PORT = process.env.PORT || 5000;

// Endpoint root
app.get('/', (req, res) => {
  res.send('Welcome to the OptiWeight API!');
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server running on https://optiweight-app.web.app`);
});