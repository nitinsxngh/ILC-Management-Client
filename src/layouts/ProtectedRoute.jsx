import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem("adminToken"); // Check if the user is logged in (replace with your logic)

  if (!isLoggedIn) {
    // Redirect to login page if not logged in
    return <Navigate to="/auth/sign-in" replace />;
  }

  return children; // Allow rendering the protected page if logged in
};

export default ProtectedRoute;
