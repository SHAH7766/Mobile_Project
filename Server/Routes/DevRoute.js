import express from 'express'
import { sendLoginAlert } from '../Utils/Login.Email.js'

const router = express.Router()

router.post('/send-test-email', async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({ success: false, message: 'Not allowed in production' })
        }

        const { email } = req.body

        if (!email) {
            return res.status(400).json({ success: false, message: 'Missing email in request body' })
        }

        const response = await sendLoginAlert(email)

        res.status(200).json({ success: true, message: 'Test email sent', response })
    }
    catch (err) {
        console.error('Dev test email send failed:', err)
        res.status(500).json({ success: false, message: 'Failed to send test email', error: err.message })
    }
})

export default router
