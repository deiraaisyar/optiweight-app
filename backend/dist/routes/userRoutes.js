"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userControllers_1 = require("../controllers/userControllers");
const router = express_1.default.Router();
// Rute untuk mendapatkan data pengguna
router.get('/users/:userId', userControllers_1.fetchUserData);
// Rute untuk menyimpan data pengguna
router.post('/users/:uid', userControllers_1.saveUserData);
exports.default = router;
