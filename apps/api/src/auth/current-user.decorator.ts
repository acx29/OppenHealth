import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { User } from "@supabase/supabase-js";

/** Pulls the Supabase user that AuthGuard attached to the request. */
export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): User => ctx.switchToHttp().getRequest().user
);
