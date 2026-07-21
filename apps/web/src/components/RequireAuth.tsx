import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";

/**
 * Route guard for private pages: valid session renders the page, no session
 * bounces to /signin. UX only — real enforcement is the API's AuthGuard.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
    const session = useSession();

    if (session === "checking") return null;
    if (session === "anon") return <Navigate to="/login" replace />;
    return <>{children}</>;
}
