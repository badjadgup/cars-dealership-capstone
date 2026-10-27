import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api";
export default function Register({ onLogin }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await api("/register/", {
        method: "POST",
        body: JSON.stringify(data),
      });
      onLogin(result.user);
      navigate("/dealers");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="auth-layout">
      <div className="auth-story">
        <span className="eyebrow">A BETTER WAY TO BUY</span>
        <h1>
          Your next chapter
          <br />
          starts here.
        </h1>
        <p>
          Save your place in a community of drivers. Share your experience and
          help someone find a dealership they can trust.
        </p>
        <div className="story-line">Real experiences. Better decisions.</div>
      </div>
      <div className="form-card">
        <span className="eyebrow">JOIN THE COMMUNITY</span>
        <h2>Create an account</h2>
        <p className="muted">A few details, and you're ready for the road.</p>
        <form onSubmit={submit}>
          <label>
            Username
            <input
              name="username"
              required
              maxLength={150}
              autoComplete="username"
              placeholder="Choose a username"
            />
          </label>
          <div className="form-row">
            <label>
              First Name
              <input
                name="first_name"
                required
                maxLength={150}
                autoComplete="given-name"
              />
            </label>
            <label>
              Last Name
              <input
                name="last_name"
                required
                maxLength={150}
                autoComplete="family-name"
              />
            </label>
          </div>
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          <small className="muted">
            Use at least 8 characters; avoid common or entirely numeric
            passwords.
          </small>
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
          <button className="button full" disabled={busy}>
            {busy ? "Creating account…" : "Register"}
          </button>
        </form>
        <p className="form-foot">
          Already a member? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
