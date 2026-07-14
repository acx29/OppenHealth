import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";

@Module({
    controllers: [AuthController],
    providers: [AuthService, AuthGuard],
    exports: [AuthGuard] // future modules (workouts, profile) will guard their routes with this
})
export class AuthModule {}
