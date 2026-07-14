import { BadRequestException, Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";

/**
 * Port of routes/authRoutes.js. Controllers declare the routes; this service
 * owns the Supabase logic. Error contract: we throw BadRequestException(message),
 * so the frontend always reads a clean `{ statusCode, message }` JSON body.
 */
@Injectable()
export class AuthService {
    constructor(private readonly supabase: SupabaseService) {}

    async signUp(email: string, password: string, siteOrigin: string) {
        if (!email || !password) {
            throw new BadRequestException("Email and password are required.");
        }

        const { data, error } = await this.supabase.client.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${siteOrigin}/signin` } // confirm link returns to the same environment
        });

        if (error) {
            throw new BadRequestException(error.message);
        }

        const userId = data.user?.id;

        if (!userId) {
            throw new BadRequestException("User was not created properly.");
        }

        // Same as the old signup: create the user_profiles row up front.
        // 23505 = unique violation, meaning the row already exists — fine for our purposes.
        const { error: profileError } = await this.supabase.client
            .from("user_profiles")
            .insert([
                {
                    id: userId,
                    name: null,
                    username: null,
                    setup_complete: false
                }
            ]);

        if (profileError && profileError.code !== "23505") {
            throw new BadRequestException(profileError.message);
        }

        return data;
    }

    /** Returns the Supabase access token (JWT); the controller turns it into the cookie. */
    async signIn(email: string, password: string): Promise<string> {
        const { data, error } = await this.supabase.client.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw new BadRequestException(error.message);
        }

        const accessToken = data.session?.access_token;

        if (!accessToken) {
            throw new BadRequestException("No access token returned");
        }

        return accessToken;
    }

    async resendConfirmation(email: string, siteOrigin: string) {
        if (!email) {
            throw new BadRequestException("Email is required.");
        }

        const { error } = await this.supabase.client.auth.resend({
            type: "signup",
            email,
            options: { emailRedirectTo: `${siteOrigin}/signin` }
        });

        if (error) {
            throw new BadRequestException(error.message);
        }

        return { message: "confirmation email sent" };
    }
}
