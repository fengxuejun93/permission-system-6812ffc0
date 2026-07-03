import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Search from "@/pages/Search";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </Router>
  );
}
