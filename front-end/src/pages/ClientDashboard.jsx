import { useEffect, useState } from "react";
import "./ClientDashboard.css";
import ServiceCard from "../components/ServiceCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ClientDashboard() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [services, setServices] = useState([]);
  const [message, setMessage] = useState([]);

  useEffect(() => {
    async function loadServices() {
      try {
        const response = await fetch(`${API_URL}/api/salon/services`);
        const data = await response.json();

        if (!response.ok) {
          return setMessage(data.message || "Cannot load services");
        }

        setServices(data.services);
      } catch {
        setMessage("No connection to server");
      }
    }
    loadServices();
  }, []);

  return (
    <div>
      <main className="client-dashboard">
        <section className="client-services-grid">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </section>
      </main>
    </div>
  );
}

export default ClientDashboard;
