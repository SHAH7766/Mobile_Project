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
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.json());
app.use(cors())
app.use(express.static(path.join(__dirname, "public")))
app.use("/api/user", userRoute);
app.use("/api/product", productRoute);
dotenv.config();
const port = process.env.port || 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`.bgMagenta);
})
connectToDatabase();
