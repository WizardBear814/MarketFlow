import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Marketplace', roles: ['*'] },
  { to: '/cart', label: 'Cart', roles: ['buyer', 'seller', 'admin'] },
  { to: '/sell', label: 'Sell', roles: ['seller', 'admin'] },
  { to: '/admin-products', label: 'Admin Products', roles: ['admin'] },
  { to: '/admin-users', label: 'Admin Users', roles: ['admin'] },
  { to: '/inventory', label: 'Inventory', roles: ['seller', 'admin'] },
  { to: '/login', label: 'Login', roles: ['guest'] },
  { to: '/register', label: 'Register', roles: ['guest'] },
];

function canSee(roles, user) {
  if (roles.includes('*')) return true;
  if (!user) return roles.includes('guest');
  if (roles.includes('auth')) return true;
  return roles.includes(user.role);
}

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <header className="topbar">
        <div className="container topbar__inner">
          <Link className="brand" to="/">
            MarketFlow
          </Link>
          <nav>
            <ul>
              {NAV_LINKS.filter((link) => canSee(link.roles, user)).map(({ to, label }) => (
                <li key={to}>
                  <NavLink to={to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
                    {label}
                  </NavLink>
                </li>
              ))}
              {user && (
                <li>
                  <span className="pill" style={{ marginRight: 6 }}>
                    {user.fullName.split(' ')[0]} · {user.role}
                  </span>
                  <a
                    href="#logout"
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                      navigate('/');
                    }}
                  >
                    Logout
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>
      <Outlet />
    </>
  );
}
