import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import type { User } from "@supabase/supabase-js";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { OnboardingDto, ProfileService } from "./profile.service";

@Controller()
@UseGuards(AuthGuard) // every profile route requires a valid session
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Get("profile")
    getProfile(@CurrentUser() user: User) {
        return this.profileService.getProfile(user.id);
    }

    @Post("profile/onboarding")
    saveOnboarding(@CurrentUser() user: User, @Body() body: OnboardingDto) {
        return this.profileService.saveOnboarding(user.id, body);
    }
}
