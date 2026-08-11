import { useEffect, useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useSessionActions } from "../hooks/useSession";
import LoadingScreen from "../components/LoadingScreen";

/** Still a stub — but it now routes un-onboarded users to the onboarding first. */
export default function Dashboard() {
    const navigate = useNavigate();
    const { markAnon } = useSessionActions();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let cancelled = false;
        api.profile()
            .then((p) => {
                if (cancelled) return;
                if (!p.onboarded_at) navigate("/onboarding", { replace: true }); // coach needs the onboarding first
                else setReady(true);
            })
            .catch((err) => {
                // don't brick the page, but never hide the failure again either
                console.error("Profile fetch failed — onboarding check skipped:", err);
                if (!cancelled) setReady(true);
            });
        return () => { cancelled = true; };
    }, [navigate]);

    const signOut = async (e: MouseEvent) => {
        e.preventDefault();
        try {
            await api.logout(); // server clears the httpOnly cookie
        } finally {
            markAnon(); // guards must stop trusting the old session before we land on /login
            navigate("/login", { replace: true });
        }
    };

    if (!ready) return <LoadingScreen />;

    return (
        <main className="stub-screen">
            <div className="stub-card">
                <h1>Dashboard</h1>
                <p>
                    Stub — coming soon. <a href="#" onClick={signOut}>Sign out</a>
                </p>
            </div>
        </main>
    );
}
