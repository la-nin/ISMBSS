import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function SalonServices() {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    service_name: "",
    description: "",
    duration_minutes: "",
    base_price: "",
    full_price: "",
    image_url: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [imageFile, setImageFile] = useState(null);

  function handleImageChange(event) {
    setImageFile(event.target.files[0]);
  }

  async function loadServices() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/api/salon/my-services`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Could not load services");
      setLoading(false);
      return;
    }

    setServices(data.services);
    setLoading(false);
  }

  useEffect(() => {
    loadServices();
  }, []);

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

      const serviceFormData = new FormData();
      serviceFormData.append("service_name", formData.service_name);
      serviceFormData.append("description", formData.description);
      serviceFormData.append("duration_minutes", formData.duration_minutes);
      serviceFormData.append("base_price", formData.base_price);
      serviceFormData.append("full_price", formData.full_price);

      if (imageFile) {
        serviceFormData.append("image", imageFile);
      }

      const response = await fetch(`${API_URL}/api/salon/services`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: serviceFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Service was not created");
        return;
      }

      setMessage("Service created successfully");

      setFormData({
        service_name: "",
        description: "",
        duration_minutes: "",
        base_price: "",
        full_price: "",
        image_url: "",
      });

      setImageFile(null);

      loadServices();
    } catch {
      setMessage("Could not connect to server");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="salon-panel">
      <h2>Create Service</h2>

      {message && <div className="alert alert-info py-2">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="service-form-grid">
          <input
            type="text"
            name="service_name"
            className="form-control"
            placeholder="Service name"
            value={formData.service_name}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="duration_minutes"
            className="form-control"
            placeholder="Duration minutes"
            value={formData.duration_minutes}
            onChange={handleChange}
            min="1"
            required
          />

          <input
            type="number"
            name="base_price"
            className="form-control"
            placeholder="Deposit price"
            value={formData.base_price}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />

          <input
            type="number"
            name="full_price"
            className="form-control"
            placeholder="Full price"
            value={formData.full_price}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />

          <input
            type="file"
            name="image"
            className="form-control"
            placeholder="Image URL"
            onChange={handleImageChange}
          />

          <textarea
            name="description"
            className="form-control service-description-field"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <button
          type="submit"
          className="btn btn-dark mt-4"
          disabled={submitting}
        >
          {submitting ? "Creating..." : "Create service"}
        </button>
      </form>

      <hr />

      <h2>Your Services</h2>

      {loading ? (
        <p>Loading services...</p>
      ) : services.length === 0 ? (
        <p>No services created yet.</p>
      ) : (
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Duration</th>
              <th>Deposit</th>
              <th>Full price</th>
            </tr>
          </thead>

          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td>{service.service_name}</td>
                <td>{service.duration_minutes} min</td>
                <td>{service.base_price}</td>
                <td>{service.full_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SalonServices;
