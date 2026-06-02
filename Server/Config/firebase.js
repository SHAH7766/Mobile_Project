import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve path pointing to root directory where firebase-key.json lives
const serviceAccountPath = path.resolve(__dirname, '../', process.env.FIREBASE_CREDENTIALS_PATH);
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log("🚀 Firebase Admin SDK Initialized Successfully!");

export default admin;