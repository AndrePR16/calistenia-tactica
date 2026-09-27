import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import OnboardingTest from "./pages/OnboardingTest.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Routine from "./pages/Routine.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/test" element={<OnboardingTest mode="lead" />} />
        <Route path="/onboarding" element={<OnboardingTest mode="profile" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/routine/:day" element={<Routine />} />
      </Routes>
    </BrowserRouter>
  );
}
