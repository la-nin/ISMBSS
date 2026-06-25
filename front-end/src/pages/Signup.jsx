import { useNavigate } from "react-router";

function Signup() {
  const navigate = useNavigate();

  return (
    <main className="container min-vh-100 d-flex align-items-center justify-content-center">
      <section>
        <h1>Choose your role</h1>

        <div>
          <button
            className="btn btn-dark px-5 py-3"
            onClick={() => navigate("/signup/client")}
          >
            Client
          </button>

          <button
            className="btn btn-dark px-5 py-3"
            onClick={() => navigate("/signup/salon")}
          >
            Salon
          </button>
        </div>
      </section>
    </main>
  );
}

export default Signup;
