import { useLocation, useNavigate, useParams } from "react-router";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function BookingPage() {
  const { serviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const service = location.state?.service;

  const [formData, setFormData] = useState({
    appointment_date: "",
    start_time: "",
  });

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/book-appointment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          service_id: serviceId,
          appointment_date: formData.appointment_date,
          start_time: formData.start_time,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Appointment was not created");
        return;
      }

      setMessage("Appointment booked successfully");
    } catch {
      setMessage("Could not connect to server");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-vh-100 d-flex justify-content-center align-items-center">
      <section className="w-100 text-center" style={{ maxWidth: "420px" }}>
        <h2>Book appointment</h2>

        {message && <div className="alert alert-info">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="">
            <div className="">
              <label className="form-label">Appointment date</label>
              <input
                type="date"
                name="appointment_date"
                className="form-control"
                value={formData.appointment_date}
                onChange={handleChange}
                required
              />

              <div className="mb-3">
                <label className="form-label">Time</label>
                <input
                  type="time"
                  name="start_time"
                  className="form-control"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-dark" disabled={submitting}>
            {submitting ? "Creating booking..." : "Confirm"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default BookingPage;
