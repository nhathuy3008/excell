import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const expiry = localStorage.getItem("token_expiry");

  const isTokenValid = token && expiry && Date.now() < parseInt(expiry);

  if (!isTokenValid) {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expiry");
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
