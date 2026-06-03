import 'dotenv/config';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { User } from '../Models/User.model.js';

const googleClientId = process.env.GOOGLE_CLIENT_ID || "943044275221-vtl9imnouk372fca2fgfmpub769mlhdb.apps.googleusercontent.com";
const client = new OAuth2Client(googleClientId);

const createAppToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

const getAvailableName = async (preferredName, email) => {
    const baseName = (preferredName || email.split('@')[0]).trim();
    let candidate = baseName;
    let suffix = 1;

    while (await User.exists({ name: candidate })) {
        suffix += 1;
        candidate = `${baseName}${suffix}`;
    }

    return candidate;
};

export const googleLogin = async (req, res) => {
    const { token, idToken } = req.body;
    const googleToken = token || idToken;

    try {
        if (!googleToken) {
            return res.status(400).json({ success: false, message: "Missing Google token." });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ success: false, message: "JWT secret is not configured." });
        }

        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: googleClientId
        });

        const payload = ticket.getPayload();

        if (!payload?.sub || !payload?.email) {
            return res.status(401).json({ success: false, message: "Invalid Google token payload." });
        }

        const { sub: googleId, email, name, picture } = payload;
        const normalizedEmail = email.trim().toLowerCase();

        console.log(`Authenticated Google User: ${name || "Unknown"} (${normalizedEmail})`);

        let user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            const availableName = await getAvailableName(name, normalizedEmail);

            user = await User.create({
                name: availableName,
                email: normalizedEmail,
                avatar: picture,
                googleId,
                isGoogleUser: true
            });

            console.log(`Created a new BuyNova user account for ${normalizedEmail}`);
        } else {
            user.googleId = user.googleId || googleId;
            user.avatar = picture || user.avatar;
            user.isGoogleUser = true;
            await user.save();
        }

        const appToken = createAppToken(user);

        return res.status(200).json({
            success: true,
            token: appToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error("Token Verification Rejected:", error.message);
        return res.status(401).json({ success: false, message: "Invalid Google token authentication" });
    }
};

export const handleGoogleSignIn = googleLogin;
