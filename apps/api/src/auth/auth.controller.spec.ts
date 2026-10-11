import { BadRequestException, INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";

/**
 * HTTP-level tests for the confirmation-email landing route. AuthService is a
 * fake, so nothing here contacts Supabase or reads the .env secrets.
 */
describe("GET /api/auth/confirm", () => {
    let app: INestApplication;
    const authService = { confirmEmail: jest.fn() };

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [{ provide: AuthService, useValue: authService }]
        })
            .overrideGuard(AuthGuard) // the real guard needs SupabaseService; /me is not under test here
            .useValue({ canActivate: () => true })
            .compile();

        app = moduleRef.createNestApplication();
        app.setGlobalPrefix("api"); // same prefix main.ts sets
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        authService.confirmEmail.mockReset();
    });

    it("redirects to /login?confirm=failed when token_hash is missing", async () => {
        const res = await request(app.getHttpServer()).get("/api/auth/confirm");

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe("/login?confirm=failed");
        expect(res.get("Set-Cookie")).toBeUndefined();
        expect(authService.confirmEmail).not.toHaveBeenCalled();
    });

    it("sets the session cookie and redirects to /dashboard when the token verifies", async () => {
        authService.confirmEmail.mockResolvedValue("jwt-from-supabase");

        const res = await request(app.getHttpServer()).get("/api/auth/confirm?token_hash=abc123&type=signup");

        expect(authService.confirmEmail).toHaveBeenCalledWith("abc123", "signup");
        expect(res.status).toBe(302);
        expect(res.headers.location).toBe("/dashboard");

        const [cookie] = res.get("Set-Cookie") ?? [];
        expect(cookie).toContain("access_token=jwt-from-supabase");
        expect(cookie).toContain("HttpOnly"); // frontend JS must never be able to read the token
        expect(cookie).toContain("SameSite=Lax");
        expect(cookie).toContain("Path=/");
        expect(cookie).toContain("Max-Age=3600"); // 1 hour, same as the login cookie
    });

    it("redirects to /login?confirm=failed and sets no cookie when Supabase rejects the token", async () => {
        authService.confirmEmail.mockRejectedValue(new BadRequestException("Email link is invalid or has expired"));

        const res = await request(app.getHttpServer()).get("/api/auth/confirm?token_hash=expired&type=signup");

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe("/login?confirm=failed");
        expect(res.get("Set-Cookie")).toBeUndefined();
    });

    it("forwards type=email as-is and verifies every other type as signup", async () => {
        authService.confirmEmail.mockResolvedValue("jwt-from-supabase");

        await request(app.getHttpServer()).get("/api/auth/confirm?token_hash=abc123&type=email");
        expect(authService.confirmEmail).toHaveBeenLastCalledWith("abc123", "email");

        // recovery/invite/email_change hashes must not be verifiable through this route
        await request(app.getHttpServer()).get("/api/auth/confirm?token_hash=abc123&type=recovery");
        expect(authService.confirmEmail).toHaveBeenLastCalledWith("abc123", "signup");

        await request(app.getHttpServer()).get("/api/auth/confirm?token_hash=abc123");
        expect(authService.confirmEmail).toHaveBeenLastCalledWith("abc123", "signup");
    });
});
