import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
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
            {/* anything unknown is honestly a 404 — no silent teleport */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
