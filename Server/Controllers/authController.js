import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js'; // 🟢 Adjust to your User model path

const client = new OAuth2Client("943044275221-vtl9imnouk372fca2fgfmpub769mlhdb.apps.googleusercontent.com");

export const googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        // 1. Verify the incoming token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "943044275221-vtl9imnouk372fca2fgfmpub769mlhdb.apps.googleusercontent.com",
        });
        
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        console.log(`Authenticated Google User: ${name} (${email})`);

        // 2. Check if user already exists in MongoDB, if not, create them
        let user = await User.findOne({ email });
        
        if (!user) {
            user = await User.create({
                name,
                email,
                avatar: picture,
                isGoogleUser: true // Useful flag if you track OAuth vs Email users
            });
            console.log(`🆕 Created a new BuyNova user account for ${email}`);
        }

        // 3. Generate your own custom BuyNova app JWT token
        const appToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // 4. Send back the payload exactly how your Android App's AuthResponse models expect it
        return res.status(200).json({
            success: true,
            token: appToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("❌ Token Verification Rejected:", error.message);
        return res.status(401).json({ success: false, message: "Invalid Google token authentication" });
    }
};