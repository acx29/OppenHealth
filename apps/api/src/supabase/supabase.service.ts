import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-side clients must never persist or auto-refresh sessions — a stored user
// session would replace the secret key on outgoing requests ("wearing the user's badge"),
// which breaks RLS bypass and can leak one user's identity into another's queries.
const SERVER_AUTH_OPTIONS = {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
};

@Injectable()
export class SupabaseService {
    /** Admin client: DB queries + token validation. NEVER call sign-in/sign-up on this one. */
    readonly client: SupabaseClient;

    private readonly url: string;
    private readonly key: string;

    constructor(config: ConfigService) {
        this.url = config.getOrThrow<string>("SUPABASE_PROJECT_URL");
        this.key = config.getOrThrow<string>("SUPABASE_SERVICE_ROLE_KEY");
        this.client = createClient(this.url, this.key, SERVER_AUTH_OPTIONS);
    }

    /**
     * Fresh, throwaway client for credential operations (signUp / signInWithPassword / resend).
     * Each call gets its own instance so user sessions can never stick to the shared admin
     * client — the bug that made the API run DB queries as the logged-in user instead of
     * as the server (RLS 42501s once RLS was enabled).
     */
    newAuthClient(): SupabaseClient {
        return createClient(this.url, this.key, SERVER_AUTH_OPTIONS);
    }
}
