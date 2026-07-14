import { Global, Module } from "@nestjs/common";
import { SupabaseService } from "./supabase.service";

@Global() // every module needs the client; global saves re-importing it everywhere
@Module({
    providers: [SupabaseService],
    exports: [SupabaseService]
})
export class SupabaseModule {}
