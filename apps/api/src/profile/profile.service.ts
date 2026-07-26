import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";

const ALLOWED_ACTIVITY = ["sedentary", "lightly_active", "active", "very_active"];

export type OnboardingDto = {
    dob?: string;
    height_cm?: number;
    weight_kg?: number;
    activity_level?: string;
    sports?: string[];
    goals?: string;
};

@Injectable()
export class ProfileService {
    private readonly logger = new Logger(ProfileService.name);

    constructor(private readonly supabase: SupabaseService) {}

    private fail(action: string, error: { message?: string; code?: string; details?: string; hint?: string }): never {
        this.logger.error(`${action} failed — code=${error.code} message=${error.message} details=${error.details} hint=${error.hint}`);
        throw new BadRequestException(error.message || "Profile operation failed.");
    }

    /** Ensures a row exists (e.g. after manual deletion or a failed signup insert). Ported from v1. */
    private async ensureUserProfile(userId: string) {
        const { data: existing, error: selectError } = await this.supabase.client
            .from("user_profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

        if (selectError) {
            this.fail("ensureUserProfile select", selectError);
        }

        if (existing) {
            return existing;
        }

        const { data: inserted, error: insertError } = await this.supabase.client
            .from("user_profiles")
            .insert([{ id: userId, name: null, username: null, setup_complete: false }])
            .select()
            .single();

        // 23505 = someone else inserted concurrently — fetch what they made
        if (insertError && insertError.code !== "23505") {
            this.fail("ensureUserProfile insert", insertError);
        }

        if (inserted) {
            return inserted;
        }

        const { data: concurrent, error: retryError } = await this.supabase.client
            .from("user_profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (retryError) {
            this.fail("ensureUserProfile concurrent select", retryError);
        }

        return concurrent;
    }

    async getProfile(userId: string) {
        return this.ensureUserProfile(userId);
    }

    /** Validates and saves the coach onboarding, stamping onboarded_at. */
    async saveOnboarding(userId: string, dto: OnboardingDto) {
        const dob = typeof dto.dob === "string" ? dto.dob.trim() : "";
        const dobDate = new Date(dob);
        if (!dob || Number.isNaN(dobDate.getTime())) {
            throw new BadRequestException("A valid date of birth is required.");
        }
        if (dobDate > new Date() || dobDate < new Date("1900-01-01")) {
            throw new BadRequestException("That date of birth doesn't look right.");
        }

        const height = Number(dto.height_cm);
        if (!Number.isFinite(height) || height < 30 || height > 300) {
            throw new BadRequestException("Height must be between 30 and 300 cm.");
        }

        const weight = Number(dto.weight_kg);
        if (!Number.isFinite(weight) || weight < 5 || weight > 1000) {
            throw new BadRequestException("Weight must be between 5 and 1000 kg.");
        }

        if (!dto.activity_level || !ALLOWED_ACTIVITY.includes(dto.activity_level)) {
            throw new BadRequestException("Pick an activity level.");
        }

        const sports = Array.isArray(dto.sports)
            ? dto.sports.filter((s) => typeof s === "string" && s.trim()).map((s) => s.trim().slice(0, 40)).slice(0, 20)
            : [];

        const goals = typeof dto.goals === "string" ? dto.goals.trim().slice(0, 2000) : "";

        await this.ensureUserProfile(userId);

        const { data, error } = await this.supabase.client
            .from("user_profiles")
            .update({
                dob,
                height_cm: height,
                weight_kg: weight,
                // fluid answers live in jsonb — new onboarding questions land here without migrations
                onboarding: { activity_level: dto.activity_level, sports, goals },
                onboarded_at: new Date().toISOString()
            })
            .eq("id", userId)
            .select()
            .single();

        if (error) {
            this.fail("saveOnboarding update", error);
        }

        return data;
    }
}
