import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getHomePath } from "../utils/navigation";
import PrivateRoute from "./PrivateRoute";

const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  return (
    <PrivateRoute>
      {allowedRoles.includes(user?.rol) || user?.rol === "admin" ? (
        children
      ) : (
        <Navigate to={getHomePath(user?.rol)} replace />
      )}
    </PrivateRoute>
  );
};

export default RoleRoute;
