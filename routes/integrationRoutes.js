import express from "express";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/integrations/garmin/connect", requireAuth, (req, res) => {
    res.status(501).json({
        status: "not_implemented",
        message:
            "Garmin sync via GarminDB is not wired yet. This endpoint is reserved for a future server-side integration."
    });
});

export default router;
