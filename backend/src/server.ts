// filepath: backend/src/server.ts
import app from './app';

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Welcome to the OptiWeight API!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});