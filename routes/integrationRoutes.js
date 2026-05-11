import express from "express";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

function notImplemented(res, provider) {
    res.status(501).json({
        status: "not_implemented",
        message: `${provider} API connection is not implemented yet. OAuth and secure token storage will be added next.`
    });
}

router.post("/integrations/strava/connect", requireAuth, (req, res) => {
    notImplemented(res, "Strava");
});

router.post("/integrations/whoop/connect", requireAuth, (req, res) => {
    notImplemented(res, "WHOOP");
});

export default router;
