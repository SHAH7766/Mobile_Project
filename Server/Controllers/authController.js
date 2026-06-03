import 'dotenv/config';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client();

export const handleGoogleSignIn = async (req, res) => {
    try {
        const { idToken } = req.body;
        const googleClientId = process.env.GOOGLE_CLIENT_ID;

        if (!idToken) {
            return res.status(400).json({ success: false, message: "Missing Google ID Token." });
        }

        if (!googleClientId) {
            return res.status(500).json({ success: false, message: "Google Client ID is not configured." });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: googleClientId
        });

        const payload = ticket.getPayload();

        if (!payload?.sub || !payload?.email) {
            return res.status(401).json({ success: false, error: "Unauthorized: Invalid Google token payload." });
        }

        const { sub: uid, name, email, picture } = payload;

        console.log(`Authenticated Google User: ${name || "Unknown"} (${email})`);

        // TODO: Find or create the user document inside your MongoDB collection here

        return res.status(200).json({
            success: true,
            message: "User authenticated successfully.",
            user: { uid, name, email, picture }
        });
    } catch (error) {
        console.error("Token Verification Rejected:", error.message);
        return res.status(401).json({ success: false, error: "Unauthorized: Invalid token source." });
    }
};
