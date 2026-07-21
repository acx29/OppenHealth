import { Link } from "react-router-dom";

/** Honest 404 — unknown URLs say so instead of silently teleporting to sign-in. */
export default function NotFound() {
    return (
        <main className="stub-screen">
            <div className="stub-card">
                <h1>404</h1>
                <p>
                    This page doesn't exist. <Link to="/">Back to OppenHealth</Link>
                </p>
            </div>
        </main>
    );
}
