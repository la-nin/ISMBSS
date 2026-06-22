import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function SalonDiscounts() {
  const [packages, setPackages] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    package_price: "",
    start_date: "",
    end_date: "",
  });

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadPackages() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/salon/discount-packages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not load packages");
        return;
      }

      setPackages(data.packages);
    } catch {
      setMessage("Could not connect to server");
    }
  }

  useEffect(() => {
    loadPackages();
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

      const response = await fetch(`${API_URL}/api/salon/discount-packages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage("Couldn not submit form");
        return;
      }

      setMessage("Discount/package has been created");

      setFormData({
        title: "",
        description: "",
        package_price: "",
        start_date: "",
        end_date: "",
      });

      loadPackages();
    } catch {
      setMessage("Could not connect to server");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container-fluid px-0">
      <div className="bg-white border rounded p-4 mb-4">
        <h2 className="mb-4">Create a package</h2>

        {message && <div className="alert alert-info py-2">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="d-flex flex-column gap-3">
            <div className="col-md-6">
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Total price</label>
              <input
                type="number"
                name="package_price"
                className="form-control"
                value={formData.package_price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Start date</label>
              <input
                type="date"
                name="start_date"
                className="form-control"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">End date</label>
              <input
                type="date"
                name="end_date"
                className="form-control"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows="3"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-dark mt-4"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create package"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default SalonDiscounts;
