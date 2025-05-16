"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes")); // Pastikan ini diimpor
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Tambahkan middleware untuk mencatat setiap permintaan
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
// Gunakan rute pengguna
app.use('/api', userRoutes_1.default);
// Gunakan rute event
app.use('/api', eventRoutes_1.default); // Pastikan ini ditambahkan
exports.default = app;
