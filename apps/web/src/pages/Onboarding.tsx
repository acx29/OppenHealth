import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import "../styles/onboarding.css";

type Status = "idle" | "loading" | "success";
type Errors = { dob?: string; height?: string; weight?: string; activity?: string; form?: string };

const ACTIVITY_LEVELS = [
    { value: "sedentary", label: "Sedentary — mostly desk life" },
    { value: "lightly_active", label: "Lightly active — 1–2 sessions a week" },
    { value: "active", label: "Active — 3–5 sessions a week" },
    { value: "very_active", label: "Very active — training most days" }
];

const SPORTS = ["Running", "Cycling", "Soccer", "Swimming", "Strength", "Other"];

/** Coach onboarding — its own clean page, deliberately not the auth shell. */
export default function Onboarding() {
    const navigate = useNavigate();
    const [dob, setDob] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [activity, setActivity] = useState("");
    const [sports, setSports] = useState<string[]>([]);
    const [goals, setGoals] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [status, setStatus] = useState<Status>("idle");
    const [shake, setShake] = useState(false); // claude made this a huge paragraph, wondering if we can clean this up into one array or smth

    // already onboarded? nothing to do here
    useEffect(() => {
        let cancelled = false;
        api.profile()
            .then((p) => { if (!cancelled && p.onboarded_at) navigate("/dashboard", { replace: true }); })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [navigate]);

    const toggleSport = (sport: string) =>
        setSports((prev) => (prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]));

    const validate = (): Errors => {
        const e: Errors = {};
        if (!dob) e.dob = "Enter your date of birth.";
        else if (new Date(dob) > new Date()) e.dob = "DOB cannot be in the future.";
        const h = Number(height);
        if (!height || !Number.isFinite(h) || h < 30 || h > 300) e.height = "Height in cm (30–300).";
        const w = Number(weight);
        if (!weight || !Number.isFinite(w) || w < 5 || w > 1000) e.weight = "Weight in kg (5–1000).";
        if (!activity) e.activity = "Pick the closest match.";
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
            await api.saveOnboarding({
                dob,
                height_cm: Number(height),
                weight_kg: Number(weight),
                activity_level: activity,
                sports,
                goals: goals.trim()
            });
            setStatus("success");
            setTimeout(() => navigate("/dashboard", { replace: true }), 650);
        } catch (err) {
            setStatus("idle");
            setErrors({ form: err instanceof ApiError ? err.message : "Something went wrong. Try again." });
            failShake();
        }
    };

    return (
        <main className="onboard-screen">
            <div className="onboard-wrap">
                <div className="onboard-brand">OppenHealth</div>

                <div className="onboard-eyebrow">Getting started</div>
                <h1 className="onboard-title">Tell Oppen about you</h1>
                <p className="onboard-sub">Oppen AI coach uses this to calibrate advice. The better the data, the better the coaching.</p>

                <form onSubmit={submit} noValidate className={shake ? "ob-shake" : undefined}>
                    <div className="ob-field">
                        <label htmlFor="dob">Date of birth</label>
                        <input
                            id="dob" type="date"
                            className={"ob-input" + (errors.dob ? " invalid" : "")}
                            value={dob}
                            onChange={(e) => { setDob(e.target.value); if (errors.dob) setErrors(p => ({ ...p, dob: undefined })); }}
                        />
                        {errors.dob && <p className="ob-err">{errors.dob}</p>}
                    </div>

                    <div className="ob-row">
                        <div className="ob-field">
                            <label htmlFor="height">Height (cm)</label>
                            <input
                                id="height" type="number" inputMode="decimal" placeholder="180"
                                className={"ob-input" + (errors.height ? " invalid" : "")}
                                value={height}
                                onChange={(e) => { setHeight(e.target.value); if (errors.height) setErrors(p => ({ ...p, height: undefined })); }}
                            />
                            {errors.height && <p className="ob-err">{errors.height}</p>}
                        </div>

                        <div className="ob-field">
                            <label htmlFor="weight">Weight (kg)</label>
                            <input
                                id="weight" type="number" inputMode="decimal" placeholder="75"
                                className={"ob-input" + (errors.weight ? " invalid" : "")}
                                value={weight}
                                onChange={(e) => { setWeight(e.target.value); if (errors.weight) setErrors(p => ({ ...p, weight: undefined })); }}
                            />
                            {errors.weight && <p className="ob-err">{errors.weight}</p>}
                        </div>
                    </div>

                    <div className="ob-field">
                        <label htmlFor="activity">How active are you?</label>
                        <select
                            id="activity"
                            className={"ob-input" + (errors.activity ? " invalid" : "")}
                            value={activity}
                            onChange={(e) => { setActivity(e.target.value); if (errors.activity) setErrors(p => ({ ...p, activity: undefined })); }}
                        >
                            <option value="" disabled>Pick the closest match</option>
                            {ACTIVITY_LEVELS.map((a) => (
                                <option key={a.value} value={a.value}>{a.label}</option>
                            ))}
                        </select>
                        {errors.activity && <p className="ob-err">{errors.activity}</p>}
                    </div>

                    <div className="ob-field">
                        <label>Sports you play</label>
                        <div className="ob-pills">
                            {SPORTS.map((sport) => (
                                <button
                                    type="button"
                                    key={sport}
                                    className={"ob-pill" + (sports.includes(sport) ? " on" : "")}
                                    aria-pressed={sports.includes(sport)}
                                    onClick={() => toggleSport(sport)}
                                >
                                    {sport}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="ob-field">
                        <label htmlFor="goals">Your goals</label>
                        <textarea
                            id="goals"
                            className="ob-input"
                            placeholder="e.g. run a sub-20 5K by December, add 5kg of muscle, sleep better…"
                            value={goals}
                            onChange={(e) => setGoals(e.target.value)}
                            maxLength={2000}
                        />
                    </div>

                    {errors.form && <p className="ob-err">{errors.form}</p>}

                    <button
                        type="submit"
                        className={"ob-btn" + (status === "loading" ? " loading" : "") + (status === "success" ? " success" : "")}
                        disabled={status !== "idle"}
                    >
                        {status === "idle" && "Start training →"}
                        {status === "loading" && <span className="ob-spinner" />}
                        {status === "success" && "Saved ✓"}
                    </button>
                </form>
            </div>
        </main>
    );
}
