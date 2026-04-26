import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { UserRole } from "../types/roles";

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const { user, loading, isInitialized, token } = useSelector((state: RootState) => state.auth);

  if (loading || (!isInitialized && token)) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!user || !allowedRoles.includes(user.role as UserRole)) {
    // Redirect to unauthorized if the role doesn't match
    return <Navigate to="/unauthorized" replace />;
  }

  // Outlet renders the child routes if the role is allowed
  return <Outlet />;
};

export default RoleRoute;
