import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

/** Still a stub — but leaving it now actually ends the session. */
export default function Dashboard() {
    const navigate = useNavigate();

    const signOut = async (e: MouseEvent) => {
        e.preventDefault();
        try {
            await api.logout(); // server clears the httpOnly cookie
        } finally {
            navigate("/login", { replace: true }); // replace: the signed-out dashboard shouldn't linger in history
        }
    };

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
