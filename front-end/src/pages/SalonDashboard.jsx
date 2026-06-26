import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import "./SalonDashboard.css";
import Navbar from "../components/Navbar";
import SalonServices from "../components/SalonServices";
import SalonDiscounts from "../components/SalonDiscounts";
import SalonProfile from "../components/SalonProfile";
import "./ClientDashboard.css";
import ServiceCard from "../components/ServiceCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function SalonDashboard() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const [activeSection, setActiveSection] = useState("dashboard");

  const [message, setMessage] = useState("");
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function loadServices() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/api/salon/my-services`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          return setMessage(data.message || "Could not load services");
        }
        setServices(data.services);
      } catch {
        setMessage("Server error");
      }
    }
    loadServices();
  }, []);

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
        {/* <section className="salon-content"> */}
        {activeSection === "dashboard" && (
          <section className="client-services-grid">
            {services.map((service) => (
              <ServiceCard
                service={service}
                showBookButton={false}
                showEditButton={true}
              />
            ))}
          </section>
        )}
        {/* </section> */}

        {activeSection === "services" && <SalonServices />}

        {activeSection === "appointments" && (
          <div className="salon-panel">
            <h2>appointments</h2>
          </div>
        )}

        {activeSection === "discounts" && <SalonDiscounts />}
        {activeSection === "profile" && <SalonProfile />}
      </main>
    </>
  );
}

export default SalonDashboard;
