import { useEffect, useState } from "react";
import { api } from "../lib/api";

export type SessionState = "checking" | "authed" | "anon";

/** One-shot session probe: asks /api/me on mount, reports which side of the velvet rope you're on. */
export function useSession(): SessionState {
    const [state, setState] = useState<SessionState>("checking");

    useEffect(() => {
        let cancelled = false;
        api.me()
            .then(() => { if (!cancelled) setState("authed"); })
            .catch(() => { if (!cancelled) setState("anon"); });
        return () => { cancelled = true; };
    }, []);

    return state;
}
