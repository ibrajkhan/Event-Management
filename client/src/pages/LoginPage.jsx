import { useState } from "react";
import { login } from "../api";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const data = await login(username, password);
      onLogin(data.user);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-shell">
      <section className="login-card">
        <p className="eyebrow">Secure Access</p>
        <h1>Event Management Login</h1>
        <p className="status-text">Only authorized users can access attendee data, scanning, and email actions.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username" />
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing In..." : "Login"}
          </button>
        </form>
        {error ? <p className="error-text">{error}</p> : null}
      </section>
    </div>
  );
}
