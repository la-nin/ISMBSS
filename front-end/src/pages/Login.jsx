import { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState(""); ////????
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!formData.email || !formData.password) {
      setMessage("Fill in the fields");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage("Login successful");

      if (data.user.role === "salon") {
        navigate("/salon/dashboard");
      }
      if (data.user.role === "worker") {
        navigate("/worker/dashboard");
      }
      if (data.user.role === "client") {
        navigate("/client/dashboard");
      }
    } catch (error) {
      setMessage("Error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel shadow-sm">
        <div className="login-brand">
          <p className="login-eyebrow">
            <h1>Sign in</h1>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {message && <div className="alert alert-info py-2">{message}</div>}

          <div className="mb-3">
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="email"
            />
          </div>

          <div className="mb-4">
            <div className="input-group">
              <input
                id="password"
                placeholder="password"
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-dark w-100 login-button"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;
