import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { I } from "../components/icons";
import AuthShell from "../components/AuthShell";

type Status = "idle" | "loading" | "done";
type Errors = { email?: string; pw?: string; pw2?: string };

export default function SignUp() {
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [pw2, setPw2] = useState("");
    const [show, setShow] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const [status, setStatus] = useState<Status>("idle");
    const [shake, setShake] = useState(false);
    const [resent, setResent] = useState(false);

    const validate = (): Errors => {
        const e: Errors = {};
        if (!email.trim()) e.email = "Enter your email.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "That email doesn't look right. Please try again";
        if (!pw) e.pw = "Choose a password.";
        else if (pw.length < 8) e.pw = "Password must be at least 8 characters.";
        if (pw && pw2 !== pw) e.pw2 = "Passwords don't match.";
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
            await api.signup(email.trim(), pw);
            setPw(""); // credentials have no business lingering in memory after this point
            setPw2("");
            setStatus("done");
        } catch (err) {
            setStatus("idle");
            const message = err instanceof ApiError ? err.message : "Something went wrong. Try again.";
            // duplicate-email errors belong under the email field; everything else under the password
            if (/already|registered/i.test(message)) setErrors({ email: message });
            else setErrors({ pw2: message });
            failShake();
        }
    };

    const resend = async () => {
        try {
            await api.resendConfirmation(email.trim());
            setResent(true);
        } catch {
            setResent(false);
        }
    };

    if (status === "done") {
        return (
            <AuthShell>
                <div className="form-inner">
                    <h1 className="title">Check your email</h1>
                    <p className="subtitle">
                        We sent a confirmation link to <b>{email.trim()}</b>. Click it, then log in.
                    </p>
                    <button type="button" className="btn btn-ghost" style={{ width: "100%" }} onClick={resend}>
                        {resent ? <>{I.check({ width: 16, height: 16 })} Sent again</> : "Resend email"}
                    </button>
                    <p className="alt">Done confirming? <Link to="/login">Log in</Link></p>
                </div>
            </AuthShell>
        );
    }

    return (
        <AuthShell>
            <form className="form-inner" onSubmit={submit} noValidate>
                <h1 className="title">Create your account</h1>
                <p className="subtitle">Start tracking your training. You'll confirm your email in one click.</p>

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
                    </div>
                    <div className="input-wrap">
                        <input
                            id="pw" type={show ? "text" : "password"} autoComplete="new-password"
                            className={"input has-btn" + (errors.pw ? " invalid" : "")}
                            placeholder="At least 8 characters"
                            value={pw}
                            onChange={(e) => { setPw(e.target.value); if (errors.pw) setErrors(p => ({ ...p, pw: undefined })); }}
                        />
                        <button type="button" className="reveal" onClick={() => setShow(s => !s)} aria-label={show ? "Hide password" : "Show password"}>
                            {show ? I.eyeOff({}) : I.eye({})}
                        </button>
                    </div>
                    {errors.pw && <div className="err">{I.alert({})} {errors.pw}</div>}
                </div>

                <div className="field">
                    <div className="field-head">
                        <label className="lbl" htmlFor="pw2">Repeat password</label>
                    </div>
                    <div className="input-wrap">
                        <input
                            id="pw2" type={show ? "text" : "password"} autoComplete="new-password"
                            className={"input" + (errors.pw2 ? " invalid" : "")}
                            placeholder="Same password again"
                            value={pw2}
                            onChange={(e) => { setPw2(e.target.value); if (errors.pw2) setErrors(p => ({ ...p, pw2: undefined })); }}
                        />
                    </div>
                    {errors.pw2 && <div className="err">{I.alert({})} {errors.pw2}</div>}
                </div>

                <button
                    type="submit"
                    className={"btn btn-primary" + (status === "loading" ? " loading" : "") + (shake ? " shake" : "")}
                    disabled={status !== "idle"}
                    style={{ marginTop: 8 }}
                >
                    {status === "idle" && <>Sign up {I.arrow({})}</>}
                    {status === "loading" && <span className="spinner" />}
                </button>

                <p className="alt">Already have an account? <Link to="/login">Log in</Link></p>
            </form>
        </AuthShell>
    );
}
