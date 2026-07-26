import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SupabaseModule } from "./supabase/supabase.module";
import { AuthModule } from "./auth/auth.module";
import { ProfileModule } from "./profile/profile.module";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ["../../.env", ".env"] }),
        SupabaseModule,
        AuthModule,
        ProfileModule
        // Coming later as the dashboard becomes real: WorkoutsModule, IntegrationsModule
    ]
})
export class AppModule {}
