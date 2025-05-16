import express from 'express';
import { fetchUserData, saveUserData } from '../controllers/userControllers';

const router = express.Router();

// Rute untuk mendapatkan data pengguna
router.get('/users/:userId', fetchUserData);

// Rute untuk menyimpan data pengguna
router.post('/users/:uid', saveUserData);

export default router;