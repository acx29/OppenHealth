import { Link } from "react-router-dom";
import "../styles/landing.css";

/**
 * Public landing at "/" — the v1 hero card carried into v2. Deliberately no auth
 * gate: it must render instantly for first-time visitors with zero API dependency.
 */
export default function Landing() {
    return (
        <main className="landing">
            <section className="landing-hero">
                <h1 className="landing-title">Optimize your habits. Oppenheimer your health.</h1>
                <p className="landing-copy">
                    Oppenheimer Health is revolutionizing the way athletes are recording, analyzing,
                    and sharing data with live AI coaching. Change your life today.
                </p>
                <div className="landing-cta">
                    <Link to="/signup" className="landing-signup-btn">
                        Sign up
                    </Link>
                    <p className="landing-signin-text">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}
