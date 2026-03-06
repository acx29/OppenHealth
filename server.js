import express from "express";
import { createClient } from '@supabase/supabase-js'; // ok we added the url and key from my supabase project below 
import dotenv from 'dotenv';

dotenv.config(); // finds the env (library) file, and loads variables from the file (class)

const app = express();
app.use(express.json());
app.use(express.static("public")); // bro we changed src -> public

const supabase = createClient( // this is the supabase object so we can call the auth bs
    process.env.SUPABASE_PROJECT_URL, 
    process.env.SUPABASE_API_KEY
);

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

app.listen(3000, () => { // acc lets you run the server
    console.log("yeah server running");
})