import { Link } from "react-router-dom";

/** Public privacy policy — linked from the auth shell footer. Reflects what the app actually does. */
export default function Privacy() {
    return (
        <main className="doc-screen">
            <article className="doc">
                <Link className="doc-back" to="/">← Back to OppenHealth</Link>

                <h1>Privacy Policy</h1>
                <p className="doc-meta">Last updated: July 16, 2026</p>

                <p>
                    OppenHealth is a personal training and health tracking app. This policy explains what
                    information we collect, why we collect it, and what we do with it. The short version:
                    we collect what the product needs to work, we don't sell your data, and we don't run
                    ads or tracking.
                </p>

                <h2>What we collect</h2>
                <ul>
                    <li><b>Account information</b> — your email address and a password. Your password is never stored in readable form; it is hashed by our authentication provider.</li>
                    <li><b>Profile information</b> — an optional display name and username.</li>
                    <li><b>Training data</b> — workouts you log (sport, duration, distance, heart rate) and data from wearables and services you explicitly choose to connect (such as Strava or WHOOP).</li>
                </ul>

                <h2>How we use it</h2>
                <ul>
                    <li>To provide the product: storing your workouts, showing your stats and trends.</li>
                    <li>To operate your account: sign-in sessions and transactional emails (for example, the email-confirmation message when you sign up).</li>
                    <li>We do <b>not</b> sell your data, share it with advertisers, or send marketing email.</li>
                </ul>

                <h2>Cookies</h2>
                <p>
                    We use a single, essential session cookie so you stay signed in. It cannot be read by
                    scripts, expires after one hour, and contains no tracking. There are no analytics or
                    advertising cookies.
                </p>

                <h2>Who processes your data</h2>
                <p>
                    Your data is stored and processed by trusted infrastructure providers acting on our
                    behalf — covering database and authentication, transactional email delivery, and
                    application hosting. These providers process your data only to run OppenHealth and
                    for no other purpose.
                </p>

                <h2>Security</h2>
                <p>
                    All traffic is encrypted with HTTPS. Passwords are hashed with an industry-standard
                    algorithm. Sessions use HTTP-only cookies that page scripts cannot read.
                </p>

                <h2>Data retention and deletion</h2>
                <p>
                    We keep your data for as long as your account exists. If you want your account and all
                    associated data deleted, contact us and we will remove them.
                </p>

                <h2>Your rights</h2>
                <p>
                    You can request a copy of the data we hold about you, ask us to correct it, or ask us
                    to delete it. Contact: <b>support@oppenhealth.com</b>.
                </p>

                <h2>Changes to this policy</h2>
                <p>
                    If this policy changes, we will update this page and the date above. Meaningful changes
                    will be communicated in the product.
                </p>
            </article>
        </main>
    );
}
