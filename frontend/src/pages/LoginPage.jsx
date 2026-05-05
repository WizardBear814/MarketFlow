import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import FormField from "../components/FormField.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const next = {};
    if (!form.email) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email.";
    if (!form.password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    try {
      setSubmitting(true);
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card auth-card">
      <h1 className="page-title">Login</h1>
      <p className="subtitle">Sign in to access your wishlist and listings.</p>

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="you@example.com"
          required
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Enter password"
          required
        />

        {submitError && <p className="error-text">{submitError}</p>}

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Login"}
        </button>
      </form>

      <p className="muted small">
        New here? <Link to="/register">Create an account</Link>
      </p>
      <p className="muted small">
        Try: <code>buyer@marketflow.com / buyer123</code>,{" "}
        <code>seller@marketflow.com / seller123</code>,{" "}
        <code>admin@marketflow.com / admin123</code>
      </p>
    </section>
  );
}
