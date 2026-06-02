import express from 'express';
import { handleGoogleSignIn } from '../Controllers/authController.js';

const authRoutes = express.Router();

authRoutes.post('/google', handleGoogleSignIn);
// authRoutes.post('/send', sendPushNotification);

export default authRoutes;