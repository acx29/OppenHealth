import express from "express";
import dotenv from 'dotenv';
import path from 'path'; //
import cookieParser from "cookie-parser"; // needed for JWT middleware, we installed with npm install cookie-parser
import { fileURLToPath } from "url"; // 

import authRoutes from "./routes/authRoutes.js"; // makes sure we can access the routers from our server
import pageRoutes from "./routes/pageRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";

dotenv.config(); // finds the env (library) file, and loads variables from the file (class)

const app = express();
const __filename = fileURLToPath(import.meta.url); // 
const __dirname = path.dirname(__filename); // 

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public"))); // bro we changed the folder name of "src" -> "public"

app.use("/api", authRoutes); // api is clean convention for backend routes, so we have /api/signup, /api/login, etc. for our auth routes, and then we have /profile for our profile route (which is also a backend route but it is not related to authentication, so it doesn't need to be under /api) and then we have the page routes which are just for serving the html files (frontend routes)
app.use("/", pageRoutes);
app.use("/api", profileRoutes);
app.use("/api", workoutRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


export default app;


