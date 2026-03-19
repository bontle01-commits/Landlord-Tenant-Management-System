import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function LandlordDashboard({ user }) {
  const [loadedUser, setLoadedUser] = useState(undefined);
  const [listings, setListings] = useState(undefined);
  const [tenants, setTenants] = useState(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoadedUser(user);
  }, [user]);

  useEffect(() => {
    if (!loadedUser?.id) return;

    const fetchData = async () => {
      try {
        const [resListings, resTenants] = await Promise.all([
          axios.get(`http://localhost:3000/api/landlord-listings/${loadedUser.id}`),
          axios.get("http://localhost:3000/api/tenants"),
        ]);

        setListings(resListings.data.listings || []);
        setTenants(resTenants.data.users || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data.");
        setListings([]);
        setTenants([]);
      }
    };

    fetchData();
  }, [loadedUser]);

  const assignTenant = async (listingId, tenantId) => {
    try {
      await axios.put(`http://localhost:3000/api/assign-tenant/${listingId}`, { tenantId });
      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, tenantId } : l))
      );
      alert("Tenant assigned successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to assign tenant.");
    }
  };

  if (loadedUser === undefined || listings === undefined || tenants === undefined) return null;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  
  const formatRand = (amount) =>
    new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);

  const totalListings = listings.length;
  const occupiedCount = listings.filter(l => l.tenantId).length;
  const vacantCount = totalListings - occupiedCount;
  const totalRevenue = listings.reduce((sum, l) => sum + (l.price || 0), 0);

  
  const priceChartData = {
    labels: listings.map(l => l.title),
    datasets: [{
      label: "Price (R)",
      data: listings.map(l => l.price),
      backgroundColor: "#3b82f6",
    }],
  };

  const occupancyChartData = {
    labels: ["Occupied", "Vacant"],
    datasets: [{
      data: [occupiedCount, vacantCount],
      backgroundColor: ["#10b981", "#f87171"],
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { font: { size: 12 } } },
      tooltip: {
        callbacks: {
          label: (context) => formatRand(context.raw)
        }
      }
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: "1.5rem", color: "#1f2937" }}>Landlord Dashboard</h1>
      <p style={{ fontSize: "1rem", color: "#4b5563" }}>Welcome, {loadedUser.name}!</p>

      {/* Summary Cards */}
      <div style={statsRow}>
        <div style={{ ...cardStyle, borderLeft: "6px solid #3b82f6" }}>
          <h4>Total Listings</h4>
          <p>{totalListings}</p>
        </div>
        <div style={{ ...cardStyle, borderLeft: "6px solid #10b981" }}>
          <h4>Occupied</h4>
          <p>{occupiedCount}</p>
        </div>
        <div style={{ ...cardStyle, borderLeft: "6px solid #f87171" }}>
          <h4>Vacant</h4>
          <p>{vacantCount}</p>
        </div>
        <div style={{ ...cardStyle, borderLeft: "6px solid #6C63FF" }}>
          <h4>Total Revenue</h4>
          <p>{formatRand(totalRevenue)}</p>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "1.5rem" }}>
        <div style={{ flex: 1, minWidth: "280px", height: "220px", background: "#fff", padding: "1rem", borderRadius: "10px", boxShadow: "0 5px 15px rgba(0,0,0,0.08)" }}>
          <h4>Price Overview</h4>
          <Bar data={priceChartData} options={chartOptions} />
        </div>
        <div style={{ flex: 1, minWidth: "280px", height: "220px", background: "#fff", padding: "1rem", borderRadius: "10px", boxShadow: "0 5px 15px rgba(0,0,0,0.08)" }}>
          <h4>Occupancy</h4>
          <Pie data={occupancyChartData} options={chartOptions} />
        </div>
      </div>

      {/* Listings */}
      <h2 style={{ marginTop: "1.5rem", fontSize: "1.25rem", color: "#1f2937" }}>Your Listings</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "0.5rem" }}>
        {listings.map(listing => (
          <div key={listing.id} style={listingCardStyle}>
            <h4 style={{ margin: "0.25rem 0" }}>{listing.title}</h4>
            <p style={{ margin: "0.25rem 0" }}><strong>Price:</strong> {formatRand(listing.price)}</p>
            <p style={{ margin: "0.25rem 0" }}>
              <strong>Tenant:</strong> {listing.tenantId ? tenants.find(t => t.id === listing.tenantId)?.email || "Unknown" : "None"}
            </p>
            <select
              value={listing.tenantId || ""}
              onChange={(e) => assignTenant(listing.id, e.target.value)}
              style={{ marginTop: "0.25rem", width: "100%", padding: "0.25rem", borderRadius: "4px" }}
            >
              <option value="">Assign tenant</option>
              {tenants.map(tenant => (
                <option key={tenant.id} value={tenant.id}>{tenant.email}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}


const containerStyle = { padding: "1rem", fontFamily: "Arial, sans-serif", maxWidth: "1200px", margin: "0 auto" };
const statsRow = { display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" };
const cardStyle = { backgroundColor: "#f3f4f6", padding: "0.5rem", borderRadius: "6px", flex: "1 1 120px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", fontSize: "0.875rem" };
const listingCardStyle = { border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", backgroundColor: "#ffffff", fontSize: "0.875rem" };

export default LandlordDashboard;