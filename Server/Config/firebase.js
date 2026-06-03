import 'dotenv/config';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let serviceAccount = null;
const credsEnv = process.env.FIREBASE_CREDENTIALS_PATH;

try {
    if (credsEnv) {
        if (credsEnv.trim().startsWith('{')) {
            serviceAccount = JSON.parse(credsEnv);
            console.log("Firebase config parsed directly from environment string.");
        } else {
            const resolvedPath = path.resolve(credsEnv);

            if (fs.existsSync(resolvedPath)) {
                serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
                console.log(`Firebase config loaded from path: ${resolvedPath}`);
            }
        }
    } else {
        const fallbackPath = path.resolve('./buy-nova-firebase-adminsdk-fbsvc-d1ded0bcb5.json');

        if (fs.existsSync(fallbackPath)) {
            serviceAccount = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
            console.log("Firebase config loaded from local fallback file.");
        }
    }

    if (serviceAccount) {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }

        console.log("Firebase Admin SDK initialized successfully!");
    } else {
        console.error("Critical Error: Unable to locate or parse Firebase Service Account credentials.");
    }
} catch (error) {
    console.error("Exception thrown during Firebase initialization:", error.message);
}

export default admin;
