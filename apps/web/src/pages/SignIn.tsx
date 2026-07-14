import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { GoogleG, I } from "../components/icons";
import "../styles/login.css";

type Status = "idle" | "loading" | "success";
type Errors = { email?: string; pw?: string };

/** Login v2 mockup ported 1:1 — except submit() now hits the real API. */
export default function SignIn() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [show, setShow] = useState(false);
    const [remember, setRemember] = useState(true);
    const [errors, setErrors] = useState<Errors>({});
    const [status, setStatus] = useState<Status>("idle");
    const [shake, setShake] = useState(false);

    const validate = (): Errors => {
        const e: Errors = {};
        if (!email.trim()) e.email = "Enter your email.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "That email doesn't look right.";
        if (!pw) e.pw = "Enter your password.";
        else if (pw.length < 8) e.pw = "Password must be at least 8 characters.";
        return e;
    };

    const failShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 420);
    };

    const submit = async (ev: FormEvent) => {
        ev.preventDefault();
        if (status !== "idle") return;

        const e = validate();
        setErrors(e);
        if (Object.keys(e).length) {
            failShake();
            return;
        }

        setStatus("loading");
        try {
            await api.login(email.trim(), pw); // sets the httpOnly session cookie on success
            setStatus("success");
            setTimeout(() => navigate("/dashboard"), 650);
        } catch (err) {
            setStatus("idle");
            // Supabase's "Invalid login credentials" (and friends) land under the password field
            setErrors({ pw: err instanceof ApiError ? err.message : "Something went wrong. Try again." });
            failShake();
        }
    };

    return (
        <div className="login">
            <div className="shell">
                {/* ---- Form pane ---- */}
                <section className="pane">
                    <div className="brand">
                        <div className="word"><b>Oppen</b><span>Health</span></div>
                    </div>

                    <div className="form-wrap">
                        <form className="form-inner" onSubmit={submit} noValidate>
                            <h1 className="title">Sign in to your console</h1>
                            <p className="subtitle">Welcome back. Sign in to sync your wearables and pick up where you left off.</p>

                            <div className="sso-row">
                                <button type="button" className="btn btn-ghost"><GoogleG /> Google</button>
                                <button type="button" className="btn btn-ghost">{I.key({})} SSO</button>
                            </div>

                            <div className="divider">or with email</div>

                            <div className="field">
                                <div className="field-head">
                                    <label className="lbl" htmlFor="email">Email</label>
                                </div>
                                <div className="input-wrap">
                                    <input
                                        id="email" type="email" autoComplete="email"
                                        className={"input" + (errors.email ? " invalid" : "")}
                                        placeholder="you@email.com"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: undefined })); }}
                                    />
                                </div>
                                {errors.email && <div className="err">{I.alert({})} {errors.email}</div>}
                            </div>

                            <div className="field">
                                <div className="field-head">
                                    <label className="lbl" htmlFor="pw">Password</label>
                                    <a className="link" href="#" onClick={e => e.preventDefault()}>Forgot password?</a>
                                </div>
                                <div className="input-wrap">
                                    <input
                                        id="pw" type={show ? "text" : "password"} autoComplete="current-password"
                                        className={"input has-btn" + (errors.pw ? " invalid" : "")}
                                        placeholder="••••••••••••"
                                        value={pw}
                                        onChange={(e) => { setPw(e.target.value); if (errors.pw) setErrors(p => ({ ...p, pw: undefined })); }}
                                    />
                                    <button type="button" className="reveal" onClick={() => setShow(s => !s)} aria-label={show ? "Hide password" : "Show password"}>
                                        {show ? I.eyeOff({}) : I.eye({})}
                                    </button>
                                </div>
                                {errors.pw && <div className="err">{I.alert({})} {errors.pw}</div>}
                            </div>

                            <div className="row-between">
                                <label className="check">
                                    <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                                    <span className="box">{I.checkThin({})}</span>
                                    Keep me signed in
                                </label>
                            </div>

                            <button
                                type="submit"
                                className={"btn btn-primary" + (status === "loading" ? " loading" : "") + (status === "success" ? " success" : "") + (shake ? " shake" : "")}
                                disabled={status !== "idle"}
                            >
                                {status === "idle" && <>Sign in {I.arrow({})}</>}
                                {status === "loading" && <span className="spinner" />}
                                {status === "success" && <>{I.check({ width: 16, height: 16 })} Authenticated</>}
                            </button>

                            <p className="alt">Don't have an account? <a href="#" onClick={e => e.preventDefault()}>Request access</a></p>
                        </form>
                    </div>

                    <div className="pane-foot">
                        <div className="legal">
                            <a href="#" onClick={e => e.preventDefault()}>Terms</a>
                            <a href="#" onClick={e => e.preventDefault()}>Privacy</a>
                            <a href="#" onClick={e => e.preventDefault()}>Support</a>
                        </div>
                    </div>
                </section>

                {/* ---- Visual pane ---- */}
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
