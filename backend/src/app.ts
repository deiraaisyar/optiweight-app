import express from 'express';
import userRoutes from './routes/userRoutes';

const app = express();

app.use(express.json());

// Middleware untuk logging waktu
app.use((req, res, next) => {
  console.time(`${req.method} ${req.url}`);
  res.on('finish', () => {
    console.timeEnd(`${req.method} ${req.url}`);
  });
  next();
});

// Gunakan rute pengguna
app.use('/api', userRoutes);

export default app;