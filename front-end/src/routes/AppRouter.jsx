import { BrowserRouter, Routes, Route, Navigate } from "react-router";
// import Menu from "../components/Menu";
// import News from "../pages/News";
// import SingleNews from "../pages/SingleNews";
// import About from "../pages/About";
import Login from "../pages/Login";
import SalonDashboard from "../pages/SalonDashboard";
import WorkerDashboard from "../pages/WorkerDashboard";
import ClientDashboard from "../pages/ClientDashboard";
import SignupForm from "../pages/SignupForm";
import Signup from "../pages/Signup";
import BookingPage from "../pages/BookingPage";

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<SingleNews />} />
        <Route path="/about" element={<About />} /> */}
        <Route
          path="/client/book/:serviceId"
          element={
            <ProtectedRoute role="client">
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/client" element={<SignupForm role="client" />} />
        <Route path="/signup/salon" element={<SignupForm role="salon" />} />
        <Route
          path="/salon/dashboard"
          element={
            <ProtectedRoute role="salon">
              <SalonDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/dashboard"
          element={
            <ProtectedRoute role="worker">
              <WorkerDashboard />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/client/dashboard"
          element={
            <ProtectedRoute role="client">
              <ClientDashboard />
            </ProtectedRoute>
          }
        ></Route>
      </Routes>
    </BrowserRouter>
  );
}
