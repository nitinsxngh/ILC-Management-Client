import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import ProtectedRoute from "@/layouts/ProtectedRoute"; // Import the protected route component

function App() {
  return (
    <Routes>
      {/* Protect dashboard routes */}
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      {/* Auth routes */}
      <Route path="/auth/*" element={<Auth />} />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
    </Routes>
  );
}

export default App;
