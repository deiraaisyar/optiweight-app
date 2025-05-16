import { createClient } from 'redis';

const redisClient = createClient({
  socket: {
    host: '127.0.0.1', // Pastikan ini sesuai dengan alamat Redis
    port: 6379,        // Pastikan ini sesuai dengan port Redis
  },
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redisClient.connect();

export default redisClient;