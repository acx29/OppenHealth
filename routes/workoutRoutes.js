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

const ALLOWED_SPORTS = ["running", "soccer", "cycling"];

/**
 * GET /api/workouts
 * Returns the signed-in user's workouts, newest first.
 * requireAuth runs first: it sets req.user from the JWT cookie.
 */
router.get("/workouts", requireAuth, async (req, res) => {
    const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", req.user.id)
        .order("created_at", { ascending: false });

    if (error) {
        return res.status(400).json({
            message: error.message || "Could not load workouts."
        });
    }

    res.json(data ?? []);
});

/**
 * POST /api/workouts
 * Body: { sport, duration_minutes, distance_miles?, avg_hr? }
 * For "running", distance_miles and avg_hr are expected (validated loosely below).
 */
router.post("/workouts", requireAuth, async (req, res) => {
    const { sport, duration_minutes, distance_miles, avg_hr } = req.body;

    if (!sport || typeof sport !== "string") {
        return res.status(400).json({ message: "Sport is required." });
    }

    const normalizedSport = sport.toLowerCase();
    if (!ALLOWED_SPORTS.includes(normalizedSport)) {
        return res.status(400).json({ message: "Invalid sport." });
    }

    const duration = Number(duration_minutes);
    if (!Number.isFinite(duration) || duration <= 0) {
        return res
            .status(400)
            .json({ message: "Duration (minutes) must be a positive number." });
    }

    if (normalizedSport === "running") {
        const dist = distance_miles != null && distance_miles !== ""
            ? Number(distance_miles)
            : NaN;
        const hr = avg_hr != null && avg_hr !== "" ? Number(avg_hr) : NaN;
        if (!Number.isFinite(dist) || dist <= 0) {
            return res
                .status(400)
                .json({ message: "Running: distance (miles) is required." });
        }
        if (!Number.isFinite(hr) || hr <= 0) {
            return res
                .status(400)
                .json({ message: "Running: average heart rate is required." });
        }

        const { data, error } = await supabase
            .from("workouts")
            .insert({
                user_id: req.user.id,
                sport: "running",
                duration_minutes: Math.round(duration),
                distance_miles: dist,
                avg_hr: Math.round(hr)
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                message: error.message || "Could not save workout."
            });
        }
        return res.status(201).json(data);
    }

    return res
        .status(501)
        .json({ message: "That sport is not implemented yet. Use Running for now." });
});

export default router;
