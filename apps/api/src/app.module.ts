import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SupabaseModule } from "./supabase/supabase.module";
import { AuthModule } from "./auth/auth.module";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ["../../.env", ".env"] }),
        SupabaseModule,
        AuthModule
        // Coming later as the dashboard becomes real: ProfileModule, WorkoutsModule, IntegrationsModule (Remove this comment after more submodules are added)
    ]
})
export class AppModule {}
