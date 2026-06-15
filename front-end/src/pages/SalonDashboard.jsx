import { useNavigate } from "react-router";
import "./SalonDashboard.css";
import Navbar from "../components/Navbar";

function SalonDashboard() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  return (
    <>
      <Navbar />
      <main className="salon-dashboard">
        <header className="salon-header">
          <div>
            <p className="salon-eyebrow">Salon name</p>
          </div>
        </header>
      </main>
    </>
  );
}

export default SalonDashboard;
