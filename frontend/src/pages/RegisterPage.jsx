import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import FormField from "../components/FormField.jsx";

export default function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "buyer",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email.";
    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 6) next.password = "Use at least 6 characters.";
    if (form.password !== form.confirm) next.confirm = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    try {
      setSubmitting(true);
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      await login({ email: form.email, password: form.password });
      navigate("/");
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card auth-card">
      <h1 className="page-title">Create Account</h1>
      <p className="subtitle">Register as a buyer or seller.</p>

      <form onSubmit={handleSubmit} noValidate>
        <FormField label="Full Name" name="name" value={form.name} onChange={handleChange} error={errors.name} required />
        <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} required />
        <FormField label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} required />
        <FormField label="Confirm Password" name="confirm" type="password" value={form.confirm} onChange={handleChange} error={errors.confirm} required />
        <FormField
          label="Account type"
          name="role"
          as="select"
          options={["buyer", "seller"]}
          value={form.role}
          onChange={handleChange}
        />

        {submitError && <p className="error-text">{submitError}</p>}

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Register"}
        </button>
      </form>

      <p className="muted small">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </section>
  );
}
