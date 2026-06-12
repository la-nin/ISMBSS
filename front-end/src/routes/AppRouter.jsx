import { BrowserRouter, Routes, Route } from "react-router";
// import Menu from "../components/Menu";
// import News from "../pages/News";
// import SingleNews from "../pages/SingleNews";
// import About from "../pages/About";
import Login from "../pages/Login";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<SingleNews />} />
        <Route path="/about" element={<About />} /> */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
