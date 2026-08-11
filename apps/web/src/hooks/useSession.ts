import { useContext } from "react";
import { SessionContext, type SessionState } from "../components/SessionProvider";

export type { SessionState };

/** Reads the app-wide session state (probed once by SessionProvider). */
export function useSession(): SessionState {
    return useContext(SessionContext).session;
}

/** Setters for the moments the session actually changes: login success, logout. */
export function useSessionActions() {
    const { markAuthed, markAnon } = useContext(SessionContext);
    return { markAuthed, markAnon };
}
