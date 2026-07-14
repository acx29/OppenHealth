"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let AuthService = class AuthService {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async signUp(email, password, siteOrigin) {
        if (!email || !password) {
            throw new common_1.BadRequestException("Email and password are required.");
        }
        const { data, error } = await this.supabase.client.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${siteOrigin}/signin` }
        });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        const userId = data.user?.id;
        if (!userId) {
            throw new common_1.BadRequestException("User was not created properly.");
        }
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
            throw new common_1.BadRequestException(profileError.message);
        }
        return data;
    }
    async signIn(email, password) {
        const { data, error } = await this.supabase.client.auth.signInWithPassword({
            email,
            password
        });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        const accessToken = data.session?.access_token;
        if (!accessToken) {
            throw new common_1.BadRequestException("No access token returned");
        }
        return accessToken;
    }
    async resendConfirmation(email, siteOrigin) {
        if (!email) {
            throw new common_1.BadRequestException("Email is required.");
        }
        const { error } = await this.supabase.client.auth.resend({
            type: "signup",
            email,
            options: { emailRedirectTo: `${siteOrigin}/signin` }
        });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return { message: "confirmation email sent" };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map