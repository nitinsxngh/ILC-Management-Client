// src/pages/auth/sign-out.jsx
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

const SignOut = () => {
  useEffect(() => {
    // Remove the adminToken to log out the user
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminRole");
  }, []);

  return <Navigate to="/auth/sign-in" replace />;
};

export default SignOut; // Ensure it's exported as default
