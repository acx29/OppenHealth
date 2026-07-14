import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response, CookieOptions } from "express";
import type { User } from "@supabase/supabase-js";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import { CurrentUser } from "./current-user.decorator";

// Same cookie format as the old Express app: httpOnly JWT, 1 hour session.
const COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true, // frontend JS can never read the token
    secure: process.env.NODE_ENV === "production", // HTTPS-only in production
    sameSite: "lax",
    path: "/"
};

/**
 * Where confirmation emails send the user back to, based on the environment the
 * request came from (dev -> localhost, prod -> oppenhealth.com). Supabase only
 * honors values on its Redirect URLs allowlist, so this can't become an open redirect.
 */
function siteOrigin(req: Request): string {
    return (
        req.headers.origin ||
        (req.get("host") ? `${req.protocol}://${req.get("host")}` : null) ||
        process.env.SITE_URL ||
        "https://oppenhealth.com"
    );
}

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("signup")
    signup(@Body() body: { email: string; password: string }, @Req() req: Request) {
        return this.authService.signUp(body.email, body.password, siteOrigin(req));
    }

    @Post("login")
    async login(
        @Body() body: { email: string; password: string },
        @Res({ passthrough: true }) res: Response // passthrough: we set the cookie but let Nest send the JSON
    ) {
        const accessToken = await this.authService.signIn(body.email, body.password);

        res.cookie("access_token", accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: 60 * 60 * 1000 // user session lasts for 1 hour max
        });

        return { message: "Logged in successfully" };
    }

    @Post("logout")
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie("access_token", COOKIE_OPTIONS);
        return { message: "User logged out." };
    }

    @Post("resend-confirmation")
    resendConfirmation(@Body() body: { email: string }, @Req() req: Request) {
        return this.authService.resendConfirmation(body.email, siteOrigin(req));
    }

    /** Small session check for the frontend: 200 with the user if the cookie is valid, 401 otherwise. */
    @Get("me")
    @UseGuards(AuthGuard)
    me(@CurrentUser() user: User) {
        return { id: user.id, email: user.email };
    }
}
