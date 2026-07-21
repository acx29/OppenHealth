import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";

/**
 * The mirror of RequireAuth — a guest-only guard for pages like /signin:
 * already signed in? You don't need a login form; go to the dashboard.
 */
export default function RedirectIfAuthed({ children }: { children: ReactNode }) {
    const session = useSession();

    if (session === "checking") return null;
    if (session === "authed") return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
}
