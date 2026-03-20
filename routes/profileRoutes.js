import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import requireAuth from "../middleware/requireAuth.js";

dotenv.config();

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_PROJECT_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.get("/profile", requireAuth, async (req, res) => {

    const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", req.user.id)
        .single();

    if(error){
        return res.status(400).json(error);
    }

    res.json(data);

});


router.post("/profile/setup", requireAuth, async (req, res) => {

    const { name, username } = req.body;

    if (!name || !username) {
        return res.status(400).json({ message: "Name and username are required." });
    }

    const { error } = await supabase
        .from("user_profiles")
        .update({
            name,
            username,
            setup_complete: true
        })
        .eq("id", req.user.id);

    if (error) {
        if (error.code === "23505") {
            return res.status(400).json({ message: "Username already taken." });
        }
        return res.status(400).json(error);
    }

    res.json({ message: "Profile setup complete." });

});

export default router;