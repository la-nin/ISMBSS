import { useNavigate } from "react-router";
import { useState } from "react";
import "./SalonDashboard.css";
import Navbar from "../components/Navbar";
import SalonServices from "../components/SalonServices";

function SalonDashboard() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <>
      <Navbar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <main className="salon-dashboard">
        <header className="salon-header">
          <div>
            <p className="salon-eyebrow">Salon name</p>
          </div>
        </header>
        <section className="salon-content">
          {activeSection === "dashboard" && (
            <div>
              <p>salon dashboard</p>
            </div>
          )}
        </section>

        {activeSection === "services" && <SalonServices />}

        {activeSection === "appointments" && (
          <div className="salon-panel">
            <h2>appointments</h2>
          </div>
        )}
      </main>
    </>
  );
}

export default SalonDashboard;
