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

/** Ensures a row exists (e.g. after manual deletion from user_profiles or failed signup insert). */
async function ensureUserProfile(userId) {
    const { data: existing, error: selectError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

    if (selectError) {
        return { data: null, error: selectError };
    }

    if (existing) {
        return { data: existing, error: null };
    }

    const { data: inserted, error: insertError } = await supabase
        .from("user_profiles")
        .insert([
            {
                id: userId,
                name: null,
                username: null,
                setup_complete: false
            }
        ])
        .select()
        .single();

    if (!insertError) {
        return { data: inserted, error: null };
    }

    if (insertError.code === "23505") {
        const { data: concurrent, error: retryError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", userId)
            .single();

        return { data: concurrent, error: retryError };
    }

    return { data: null, error: insertError };
}

router.get("/profile", requireAuth, async (req, res) => {
    const { data, error } = await ensureUserProfile(req.user.id);

    if (error) {
        return res.status(400).json(error);
    }

    res.json(data);
});


router.post("/profile/setup", requireAuth, async (req, res) => {

    const { name, username } = req.body;

    if (!name || !username) {
        return res.status(400).json({ message: "Name and username are required." });
    }

    const { error: ensureError } = await ensureUserProfile(req.user.id);

    if (ensureError) { // ensures that the user profile exists
        return res.status(400).json(ensureError);
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