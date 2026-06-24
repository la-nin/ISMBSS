import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function SalonProfile() {
  const [formData, setFormData] = useState({
    salon_name: "",
    description: "",
    address: "",
    city: "",
    cancellation_days_limit: "",
    email: "",
    phone_number: "",
  });

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadProfile() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/api/salon/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Could not load profile");
      return;
    }

    setFormData({
      salon_name: data.profile.salon_name || "",
      description: data.profile.description || "",
      address: data.profile.address || "",
      city: data.profile.city || "",
      cancellation_days_limit: data.profile.cancellation_days_limit || "",
      email: data.profile.email || "",
      phone_number: data.profile.phone_number || "",
    });
  }

  useEffect(() => {
    loadProfile();
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

      // const profileFormData = new FormData();
      // profileFormData.append("salon_name", formData.salon_name);
      // profileFormData.append("description", formData.description);
      // profileFormData.append("address", formData.address);
      // profileFormData.append("city", formData.city);
      // profileFormData.append(
      //   "cancellation_days_limit",
      //   formData.cancellation_days_limit,
      // );
      // profileFormData.append("email", formData.email);
      // profileFormData.append("phone_number", formData.phone_number);

      const response = await fetch(`${API_URL}/api/salon/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not upadate salon details");
        return;
      }

      setMessage("Salon profile updated sucessfully");
      loadProfile();
    } catch {
      setMessage("Could not connect to server");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <section>
      <div className="container-fluid px-0">
        <div className="bg-white border rounded p-4">
          <h2 className="mb-4">Salon profile</h2>

          {message && <div className="alert alert-info py-2">{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="">
              <div className="">
                <label>Salon name</label>
                <input
                  type="text"
                  name="salon_name"
                  className="form-control"
                  value={formData.salon_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="">
              <div className="">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="">
              <div className="">
                <label className="">City</label>
                <input
                  type="text"
                  name="city"
                  className="form-control"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="">
              <div className="">
                <label className="">Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="">
              <div className="">
                <label className="">Phone number</label>
                <input
                  type="text"
                  name="phone_number"
                  className="form-control"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="">
              <div className="">
                <label className="">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="">
              <div className="">
                <label className="">Cancellation days limit</label>
                <input
                  type="number"
                  name="cancellation_days_limit"
                  className="form-control"
                  value={formData.cancellation_days_limit}
                  onChange={handleChange}
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-dark mt-4"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save profile"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default SalonProfile;
