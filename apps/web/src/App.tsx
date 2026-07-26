import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import RequireAuth from "./components/RequireAuth";
import RedirectIfAuthed from "./components/RedirectIfAuthed";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route
                path="/login"
                element={
                    <RedirectIfAuthed>
                        <Login />
                    </RedirectIfAuthed>
                }
            />
            <Route
                path="/signup"
                element={
                    <RedirectIfAuthed>
                        <SignUp />
                    </RedirectIfAuthed>
                }
            />
            <Route
                path="/dashboard"
                element={
                    <RequireAuth>
                        <Dashboard />
                    </RequireAuth>
                }
            />
            <Route
                path="/onboarding"
                element={
                    <RequireAuth>
                        <Onboarding />
                    </RequireAuth>
                }
            />
            {/* public document pages — no auth gate in either direction */}
            <Route path="/privacy" element={<Privacy />} />
            {/* anything unknown is honestly a 404 — no silent teleport */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
