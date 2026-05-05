import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormField from "../components/FormField.jsx";
import { getListing, updateListing } from "../api/listings.js";
import { useAuth } from "../context/AuthContext.jsx";

const CATEGORIES = ["Electronics", "Home", "Clothing", "Books", "Other"];

export default function EditListingPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getListing(id)
      .then((l) => {
        setForm({
          title: l.title,
          description: l.description,
          price: String(l.price),
          category: l.category,
          location: l.location,
        });
      })
      .catch((err) => setSubmitError(err.message));
  }, [id]);

  function handleChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const next = {};
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.description.trim()) next.description = "Description is required.";
    if (form.price === "" || isNaN(Number(form.price))) next.price = "Enter a valid price.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    try {
      setSubmitting(true);
      await updateListing(id, form, user);
      navigate(`/listings/${id}`);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!form) return <p>Loading…</p>;

  return (
    <section className="card form-card">
      <h1 className="page-title">Edit Listing</h1>

      <form onSubmit={handleSubmit} noValidate>
        <FormField label="Title" name="title" value={form.title} onChange={handleChange} error={errors.title} required />
        <FormField
          label="Description"
          name="description"
          as="textarea"
          value={form.description}
          onChange={handleChange}
          error={errors.description}
          required
        />
        <div className="grid grid-2">
          <FormField label="Price (USD)" name="price" type="number" value={form.price} onChange={handleChange} error={errors.price} required />
          <FormField
            label="Category"
            name="category"
            as="select"
            options={CATEGORIES}
            value={form.category}
            onChange={handleChange}
          />
        </div>
        <FormField label="Location" name="location" value={form.location} onChange={handleChange} />

        {submitError && <p className="error-text">{submitError}</p>}

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save changes"}
        </button>
      </form>
    </section>
  );
}
