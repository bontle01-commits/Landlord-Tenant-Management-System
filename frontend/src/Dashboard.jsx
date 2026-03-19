import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import TenantMyRoom from "./Pages/TenantMyRoom";
import LandlordDashboard from "./Pages/LandlordDashboard.jsx";

function Dashboard() {
  const [user, setUser] = useState(undefined); 

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser ?? null);
    } catch {
      setUser(null);
    }
  }, []);

  
  if (user === undefined) return null; 

  if (!user) return <Navigate to="/" replace />;

  return user.role === "LANDLORD"
    ? <LandlordDashboard user={user} />
    : user.role === "TENANT"
    ? <TenantMyRoom user={user} />
    : <p>Invalid user role</p>;
}

export default Dashboard;