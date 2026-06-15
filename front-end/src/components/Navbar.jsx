import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import "./Navbar.css";

const salonLinks = [
  { label: "Dashboard", path: "/salon/dashboard" },
  { label: "Appointments", path: "salon/appointments" },
  { label: "Services", path: "salon/services" },
  { label: "Workers", path: "salon/workers" },
  { label: "Client Records", path: "salon/client-records" },
  { label: "Payments", path: "salon/payments" },
  { label: "Discounts & Packages", path: "/salon/discounts-packages" },
  { label: "Profile", path: "salon/profile" },
  { label: "Notifications", path: "salon/notifications" },
];

function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const links = user?.role == "salon" ? salonLinks : [];

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
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              isActive ? "navbar-link active" : "navbar-link"
            }
            onClick={() => setIsOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}

        <button type="button" className="navbar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
