import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const supabase = createClient( // this is the supabase object so we can call the auth bs
    process.env.SUPABASE_PROJECT_URL, // grab these variables from the .env file
    process.env.SUPABASE_SERVICE_ROLE_KEY //
);

// 'signup' has NOTHING to do with signUp.html. This is just the backend version of the method u were doing earlier
router.post("/signup", async (req, res) => {
    const { email, password } = req.body; // assigning email, password variables to whatever is in req.body
    
    const { data, error } = await supabase.auth.signUp({
        email: email, 
        password: password
    });
 
    if (error) {
        return res.status(400).json(error);
    }

    const userId = data.user?.id; // get id

    if (!userId) {
        return res.status(400).json({ message: "User was not created properly." });
    }

    const { error: profileError } = await supabase
        .from("user_profiles")
        .insert([
            {
                id: userId, // setting null because it hasnt prompted user yet
                name: null,
                username: null,
                setup_complete: false
            }
        ]);

    if (profileError) {
        return res.status(400).json(profileError);
    }

    res.json(data);
});

router.post("/login", async (req, res) => { 
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if(error){
        return res.status(400).json(error); // we are returning error message in res (response)
    }

    const accessToken = data.session?.access_token; // storing JWT

    if (!accessToken) { // so it doesn't blow up with null token error
        return res.status(400).json({ message: "No access token returned" });
    } 

    res.cookie("access_token", accessToken, {
        httpOnly: true, // can only be accessed via HTTP request, frontend cannot access the token
        secure: process.env.NODE_ENV === "production", // send cookie over HTTPS only in production
        sameSite: "lax",
        maxAge: 60 * 60 * 1000, // user session lasts for 1 hour max
        path: "/"
    })

    res.json({message: "Logged in (cookie returned) succesfully"});
});

router.post("/resend-confirmation", async (req, res) => { // resend email confirmation if necesary from the backend
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

router.post("/logout", async (req, res) => {
    res.clearCookie("access_token", {
        httpOnly: true, // extra secure, only server can read cookie
        secure: process.env.NODE_ENV === "production", // not sure what these two lines do
        sameSite: "lax", // how strict cross site cookie sending
        path: "/" // overall path
    });

    res.json({message: "User logged out."});

})

export default router;

