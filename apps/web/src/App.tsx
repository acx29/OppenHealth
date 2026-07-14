import { Navigate, Route, Routes } from "react-router-dom";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/signin" replace />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* anything unknown lands on the login */}
            <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
    );
}
