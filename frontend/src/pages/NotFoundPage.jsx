import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="card">
      <h1 className="page-title">Page not found</h1>
      <p>The page you’re looking for doesn’t exist.</p>
      <Link className="btn btn-primary" to="/">Back to browse</Link>
    </div>
  );
}
