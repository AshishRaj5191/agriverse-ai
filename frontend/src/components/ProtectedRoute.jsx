import { Navigate, useLocation } from 'react-router-dom';
import { getUserRole, isAuthenticated } from '../utils/auth';

function ProtectedRoute({ children, allowedRoles = [], redirectTo = '/login' }) {
  const location = useLocation();
  const authenticated = isAuthenticated();

  if (!authenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles.length > 0) {
    const userRole = getUserRole();
    if (!userRole || !allowedRoles.includes(userRole)) {
      const fallback = userRole ? `/${userRole}/dashboard` : '/login';
      return <Navigate to={fallback} replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
