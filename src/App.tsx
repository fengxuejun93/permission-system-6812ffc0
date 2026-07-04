import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Search from "@/pages/Search";
import Knowledge from "@/pages/Knowledge";
import Notifications from "@/pages/Notifications";
import Classmates from "@/pages/Classmates";
import { ToastProvider } from "@/components/Toast";

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/classmates" element={<Classmates />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}
