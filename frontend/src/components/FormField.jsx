export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  as = "input",
  options,
  required,
  rows = 3,
}) {
  function handleChange(e) {
    onChange(name, e.target.value);
  }

  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      <label htmlFor={name}>
        {label}{required ? " *" : ""}
      </label>

      {as === "textarea" && (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows}
        />
      )}

      {as === "select" && (
        <select id={name} name={name} value={value} onChange={handleChange}>
          {options?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {as === "input" && (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
        />
      )}

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
