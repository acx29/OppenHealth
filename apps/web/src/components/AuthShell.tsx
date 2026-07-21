import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "../styles/login.css";

/** Shared split-pane frame for auth pages: brand + form pane left, marketing visual right. */
export default function AuthShell({ children }: { children: ReactNode }) {
    return (
        <div className="login">
            <div className="shell">
                <section className="pane">
                    <div className="brand">
                        <div className="word"><b>Oppen</b><span>Health</span></div>
                    </div>

                    <div className="form-wrap">{children}</div>

                    <div className="pane-foot">
                        <div className="legal">
                            <a href="#" onClick={e => e.preventDefault()}>Terms</a>
                            <Link to="/privacy">Privacy</Link>
                            <a href="#" onClick={e => e.preventDefault()}>Support</a>
                        </div>
                    </div>
                </section>

                <aside className="visual">
                    <div className="img" />
                    <div className="scrim" />
                    <div className="v-top">
                        <a href="#" onClick={e => e.preventDefault()}>Status</a>
                    </div>
                    <div className="visual-content">
                        <div className="v-eyebrow">Performance Intelligence</div>
                        <h2>Optimize your habits. <span className="hl">Oppenheimer your health.</span></h2>
                        <p className="v-sub">Record workouts, sync your wearables, and train smarter with a personalized AI coach. OppenHealth turns your data into decisions so every session counts.</p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
