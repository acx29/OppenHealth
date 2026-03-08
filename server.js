import express from "express";
import { createClient } from '@supabase/supabase-js'; // ok we added the url and key from my supabase project below 
import dotenv from 'dotenv';
import path from 'path'; //
import { fileURLToPath } from "url"; // 

dotenv.config(); // finds the env (library) file, and loads variables from the file (class)

const app = express();
app.use(express.json());
app.use(express.static("public")); // bro we changed the folder name of "src" -> "public"

const __filename = fileURLToPath(import.meta.url); // 
const __dirname = path.dirname(__filename); // 

const supabase = createClient( // this is the supabase object so we can call the auth bs
    process.env.SUPABASE_PROJECT_URL, // 
    process.env.SUPABASE_API_KEY //
);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));

});

// 'signup' has NOTHING to do with signUp.html. This is just the backend version of the method u were doing earlier
app.post("/api/signup", async (req, res) => {
    const { username, password } = req.body; // assigning username, password variables to whatever is in req.body
    
    const { data, error } = await supabase.auth.signUp({
        email: username, 
        password: password
    });

    if(error){
        return res.status(400).json(error); // yeah in case this bs doesnt work
    }

    res.json(data); // if u got into tause

});

app.post("/api/login", async (req, res) => { // resend email confirmation if necesary from the backend
    const { username, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password
    });

    if(error){
        return res.status(400).json(error); // we are returning error message in res (response)
    }

    res.json(data); // else we are returning the tause (accepted) data

});

app.post("/api/resend-confirmation", async (req, res) => {
    const { email } = req.body; // grabbing the email that we want the backend to resend the confirmation to
    
    const { data, error} = await supabase.auth.resend({
        type: "signup",
        email: email
    }); // attempting to run the func and then seeing if theres an error not

    if(error) {
        return res.status(400).json(error); // status: telling the BROWSER (remember this is in server.js), and json(error) is the key : value pair of what error
    }

    res.json({ message: "confirmation email sent" });
});

export default app;
