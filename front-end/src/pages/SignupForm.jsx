import { useState } from "react";
import { useNavigate } from "react-router";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function SignupForm({ role }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone_number: "",
    salon_name: "",
    description: "",
    address: "",
    city: "",
    cancellation_days_limit: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
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
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          role,
          cancellation_days_limit: Number(formData.cancellation_days_limit),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage("Unable to create account");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (role === "salon") {
        navigate("/salon/dashboard");
      } else {
        navigate("/client/dashboard");
      }
    } catch {
      setMessage("Server error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container min-vh-100 d-flex justify-content-center align-items-center py-5">
      <section className="w-100" style={{ maxWidth: "420px" }}>
        {message && <div className="alert alert-danger">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">First name</label>
              <input
                className="form-control"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Last name</label>
              <input
                className="form-control"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Phone number</label>
              <input
                className="form-control"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength="6"
                required
              />
            </div>

            {role === "salon" && (
              <>
                <div className="col-12">
                  <label className="form-label">Salon name</label>
                  <input
                    className="form-control"
                    name="salon_name"
                    value={formData.salon_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Address</label>
                  <input
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">City</label>
                  <input
                    className="form-control"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">
                    How many days in advance can a user cancel
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    name="cancellation_days_limit"
                    value={formData.cancellation_days_limit}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn btn-dark w-100"
              disabled={submitting}
            >
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default SignupForm;
