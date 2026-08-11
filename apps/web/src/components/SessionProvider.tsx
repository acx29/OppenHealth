import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../lib/api";

export type SessionState = "checking" | "authed" | "anon";

type SessionContextValue = {
    session: SessionState;
    /** Call after a successful login — the cookie is set, no need to re-ask the API. */
    markAuthed: () => void;
    /** Call after logout — guards must stop trusting the old answer immediately. */
    markAnon: () => void;
};

export const SessionContext = createContext<SessionContextValue>({
    session: "checking",
    markAuthed: () => {},
    markAnon: () => {}
});

/**
 * Asks /api/me once per app load and shares the answer via context, so every
 * guard reads an already-known value instead of re-probing the API on mount.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<SessionState>("checking");

    useEffect(() => {
        let cancelled = false;
        api.me()
            .then(() => { if (!cancelled) setSession("authed"); })
            .catch(() => { if (!cancelled) setSession("anon"); });
        return () => { cancelled = true; };
    }, []);

    const value = useMemo(
        () => ({
            session,
            markAuthed: () => setSession("authed"),
            markAnon: () => setSession("anon")
        }),
        [session]
    );

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
