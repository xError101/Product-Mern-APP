import express from "express";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db.js";

import productRouters from "./routes/product.routes.js";

dotenv.config();
const PORT = process.env.PORT || 5000
const __dirname = path.resolve();

const app = express();

app.use(express.json()) //Allows us to accept JSON data in the req.body

app.use("/api/products", productRouters)

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "/frontend/dist")));

    app.get("*", (req,res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
    })
}

app.listen(PORT, () => {
    connectDB();
    console.log("Server started at http://localhost:"+PORT)
}) 