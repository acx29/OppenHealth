import { Link } from "react-router-dom";

/** Port of dashboard-stub.html — intentionally a stub until the real dashboard milestone. */
export default function Dashboard() {
    return (
        <main className="stub-screen">
            <div className="stub-card">
                <h1>Dashboard</h1>
                <p>
                    Stub — coming soon. <Link to="/signin">Back to login</Link>
                </p>
            </div>
        </main>
    );
}
