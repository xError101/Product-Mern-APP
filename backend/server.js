import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import productRouters from "./routes/product.routes.js";

dotenv.config();
const PORT = process.env.PORT || 5000

const app = express();

app.use(express.json()) //Allows us to accept JSON data in the req.body

app.use("/api/products", productRouters)

app.listen(PORT, () => {
    connectDB();
    console.log("Server started at http://localhost:"+PORT)
}) 