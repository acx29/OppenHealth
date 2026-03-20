import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_PROJECT_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function requireAuth(req, res, next) {
    const token = req.cookies.access_token; // grab JWT through a cookie (which is why we have cookie-parser)

    if(!token){
        return res.redirect("/signIn.html");
    }

    const { data, error } = await supabase.auth.getUser(token); 

    if(error || !data.user){
        res.clearCookie("access_token");
        return res.redirect("/signIn.html");
    }

    req.user = data.user;
    next();

}

export default requireAuth;