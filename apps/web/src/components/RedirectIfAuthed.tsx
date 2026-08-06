import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";

/**
 * The mirror of RequireAuth — a guest-only guard for pages like /signin:
 * already signed in? You don't need a login form; go to the dashboard.
 */
export default function RedirectIfAuthed({ children }: { children: ReactNode }) {
    const session = useSession();

    // if (session === "checking") return null;

    // Render the page immediately while the session check runs in the background —
    // guest pages hide nothing sensitive, and a slow/cold API must never blank the screen.
    // Worst case: an already-authed user sees the login form briefly before bouncing.
    if (session === "authed") return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
}
