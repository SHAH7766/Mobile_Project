import admin from '../config/firebase.js';

export const handleGoogleSignIn = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ success: false, message: "Missing Google ID Token." });
        }

        // 1. Verify the token using your Firebase Admin SDK instance
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        
        // 2. Unpack the user's authentic profile info
        const { uid, name, email, picture } = decodedToken;

        console.log(`🚀 Authenticated Google User: ${name} (${email})`);

        // TODO: Find or create the user document inside your MongoDB collection here
        
        return res.status(200).json({
            success: true,
            message: "User authenticated successfully.",
            user: { uid, name, email, picture }
        });

    } catch (error) {
        console.error("❌ Token Verification Rejected:", error.message);
        return res.status(401).json({ success: false, error: "Unauthorized: Invalid token source." });
    }
};