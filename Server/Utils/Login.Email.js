import { Resend } from "resend";
import dotenv from 'dotenv';
dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLoginAlert(userEmail) {
        try {
            await resend.emails.send({
                from: 'BuyNova Security <onboarding@resend.dev>',
                to: userEmail, // 🟢 This dynamically target whoever logs in (globalmajid12 or shahussainbadshah786)
                subject: 'New Login Detected on BuyNova 🔐',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #212529; background-color: #F8F9FA;">
                        <h2 style="color: #FF5722;">Security Alert!</h2>
                        <p>Hello,</p>
                        <p>We detected a new successful login to your BuyNova account using the email: <strong>${userEmail}</strong>.</p>
                        <p>If this was you, you can safely ignore this security notice. Happy shopping!</p>
                        <br>
                        <p style="color: #6C757D; font-size: 12px;">BuyNova Dev Security Team</p>
                    </div>
                `
            });
            console.log(`Login alert email cleanly dispatched to: ${userEmail}`);
        } catch (err) {
            console.error("Failed to dispatch login email via Resend API:", err);
        }
    }