import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { SupabaseService } from "../supabase/supabase.service";

/**
 * Port of the old requireAuth middleware. One difference: this is an API-only
 * backend now, so an unauthenticated request gets a 401 JSON response instead
 * of a redirect — the React app decides where to send the user.
 */
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly supabase: SupabaseService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();
        const token = req.cookies?.["access_token"];

        if (!token) {
            throw new UnauthorizedException("Not signed in.");
        }

        const { data, error } = await this.supabase.client.auth.getUser(token);

        if (error || !data.user) {
            throw new UnauthorizedException("Session expired.");
        }

        (req as any).user = data.user;
        return true;
    }
}
