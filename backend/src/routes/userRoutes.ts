import express from 'express';
import { saveUserData } from '../controllers/userControllers';

const router = express.Router();

router.post('/users/:uid', saveUserData);

export default router;