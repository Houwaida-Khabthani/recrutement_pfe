import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

const PrivateRoute = () => {
  const { token, loading, isInitialized } = useSelector((state: RootState) => state.auth);

  if (loading || (!isInitialized && token)) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!token) {
    // Redirect to home if not logged in
    return <Navigate to="/" replace />;
  }

  // Outlet renders the child routes
  return <Outlet />;
};

export default PrivateRoute;
