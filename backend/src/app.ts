import express from 'express';
import userRoutes from './routes/userRoutes';
import eventRoutes from './routes/eventRoutes'; // Pastikan ini diimpor

const app = express();

app.use(express.json());

// Tambahkan middleware untuk mencatat setiap permintaan
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Gunakan rute pengguna
app.use('/api', userRoutes);

// Gunakan rute event
app.use('/api', eventRoutes); // Pastikan ini ditambahkan

export default app;