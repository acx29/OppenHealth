import { useEffect, useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

/** Still a stub — but it now routes un-onboarded users to the onboarding first. */
export default function Dashboard() {
    const navigate = useNavigate();
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
            navigate("/login", { replace: true });
        }
    };

    if (!ready) return null;

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
