"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)({
    socket: {
        host: '127.0.0.1', // Pastikan ini sesuai dengan alamat Redis
        port: 6379, // Pastikan ini sesuai dengan port Redis
    },
});
redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});
redisClient.connect();
exports.default = redisClient;
