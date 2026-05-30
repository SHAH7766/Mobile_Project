import express from 'express';
import colors from 'colors'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
const app = express();
import { connectToDatabase } from "./Config/DatabaseConnection.js"
import dotenv from 'dotenv';
import userRoute from "./Routes/UserRoute.js"
import productRoute from "./Routes/ProductRoute.js"
import devRoute from "./Routes/DevRoute.js"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const allowedOrigins = [
    
    "https://buynova.vercel.app",
    "http://localhost:5173"
]
const vercelPreviewOriginRegex = /^https:\/\/mobile-project-[a-z0-9-]+-shah7766s-projects\.vercel\.app$/i

app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || vercelPreviewOriginRegex.test(origin)) {
            return callback(null, true)
        }

        callback(new Error("Not allowed by CORS"))
    }
}))
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "BuyNova API is running"
    })
})

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "ok"
    })
})

app.use(express.static(path.join(__dirname, "public")))
app.use("/api/user", userRoute);
app.use("/api/product", productRoute);
if (process.env.NODE_ENV !== 'production') {
    app.use("/api/dev", devRoute);
}
dotenv.config();
const port = process.env.PORT || process.env.port || 8000;
app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port}`.bgMagenta);
})
connectToDatabase();
