import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let serviceAccount = null;
const credsEnv = process.env.FIREBASE_CREDENTIALS_PATH;

try {
    if (credsEnv) {
        // 1. If it starts with a curly brace, parse it directly as a raw JSON string (Railway production)
        if (credsEnv.trim().startsWith('{')) {
            serviceAccount = JSON.parse(credsEnv);
            console.log("🟢 Firebase config parsed directly from environment string.");
        } else {
            // 2. Otherwise, treat it as a file path string (Alternative config)
            const resolvedPath = path.resolve(credsEnv);
            if (fs.existsSync(resolvedPath)) {
                serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
                console.log(`🟢 Firebase config loaded from path: ${resolvedPath}`);
            }
        }
    } else {
        // 3. Local Development Fallback: If no env variable exists, look for your hidden local file
        const fallbackPath = path.resolve('./Server/buy-nova-firebase-adminsdk-fbsvc-d1ded0bcb5.json');
        if (fs.existsSync(fallbackPath)) {
            serviceAccount = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
            console.log("🟢 Firebase config loaded from local fallback file.");
        }
    }

    // 4. Initialize the SDK if credentials were successfully acquired
    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("🔥 Firebase Admin SDK initialized successfully!");
    } else {
        console.error("❌ Critical Error: Unable to locate or parse Firebase Service Account credentials.");
    }
} catch (error) {
    console.error("❌ Exception thrown during Firebase initialization:", error.message);
}