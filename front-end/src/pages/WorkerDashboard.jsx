import "./WorkerDashboard.css";
import Navbar from "../components/Navbar";

function WorkerDashboard() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  return (
    <>
      <Navbar />

      <main className="worker-dashboard">
        <header className="worker-header">
          <div>
            <h1>Welcome, {user?.first_name}</h1>
          </div>
        </header>

        <section className="worker-stats">
          <article className="worker-card">
            <span>Today's appointments:</span>
            <strong>0</strong>
          </article>

          <article className="worker-card">
            <span>Upcoming appointments</span>
            <strong>0</strong>
          </article>

          <article className="worker-card">Completed services</article>
        </section>
      </main>
    </>
  );
}

export default WorkerDashboard;
