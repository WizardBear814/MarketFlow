import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function RequireAuth({ roles, children }) {
  const { user } = useAuth();

  if (!user) {
    return (
      <main className="container">
        <h1 className="page-title">Login required</h1>
        <div className="card" style={{ textAlign: 'center' }}>
          <p>
            Please <Link to="/login" className="link">log in</Link> to view this page.
          </p>
        </div>
      </main>
    );
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <main className="container">
        <h1 className="page-title">Access denied</h1>
        <div className="card">
          <p>
            You don&apos;t have permission to view this page. It&apos;s restricted to:{' '}
            <strong>{roles.join(', ')}</strong>.
          </p>
        </div>
      </main>
    );
  }

  return children;
}
