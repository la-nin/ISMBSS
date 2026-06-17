import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import "./Navbar.css";

const salonLinks = [
  { label: "Dashboard", section: "dashboard" },
  { label: "Appointments", section: "appointments" },
  { label: "Services", section: "services" },
  { label: "Workers", section: "workers" },
  { label: "Client Records", section: "client-records" },
  { label: "Payments", section: "payments" },
  { label: "Discounts & Packages", section: "discounts" },
  { label: "Salon Profile", section: "profile" },
  { label: "Notifications", section: "notifications" },
];

const workerLinks = [
  { label: "Dashboard", path: "/worker/dashboard" },
  { label: "Schedule", path: "/worker/schedule" },
  { label: "Profile", path: "/worker/profile" },
  { label: "Notifications", path: "/worker/notifications" },
];

function Navbar({ activeSection, onSectionChange }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const links =
    user?.role == "salon"
      ? salonLinks
      : user?.role == "worker"
        ? workerLinks
        : [];

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <nav className="app-navbar">
      <div className="navbar-brand-block">
        <span className="navbar-brand-title">Beauty Salon</span>
        <span className="navbar-brand-role">{user?.role || "user"}</span>
      </div>

      <button
        type="button"
        className="navbar-toggle"
        onClick={() => setIsOpen((current) => !current)}
      >
        Menu
      </button>

      <div className={`navbar-links ${isOpen ? "is-open" : ""}`}>
        {links.map((link) => (
          <button
            key={link.section}
            type="button"
            className={
              activeSection === link.section
                ? "navbar-link active"
                : "navbar-link"
            }
            onClick={() => {
              onSectionChange(link.section);
              setIsOpen(false);
            }}
          >
            {link.label}
          </button>
        ))}

        <button type="button" className="navbar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
