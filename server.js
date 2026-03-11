import express from "express";
import dotenv from 'dotenv';
import path from 'path'; //
import cookieParser from "cookie-parser"; // needed for JWT middleware, we installed with npm install cookie-parser
import { fileURLToPath } from "url"; // 

import authRoutes from "./routes/authRoutes.js"; // makes sure we can access the routers from our server
import pageRoutes from "./routes/pageRoutes.js";

dotenv.config(); // finds the env (library) file, and loads variables from the file (class)

const app = express();
const __filename = fileURLToPath(import.meta.url); // 
const __dirname = path.dirname(__filename); // 

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public"))); // bro we changed the folder name of "src" -> "public"

app.use("/api", authRoutes); // since we are using the JWT it must be through API?
app.use("/", pageRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
