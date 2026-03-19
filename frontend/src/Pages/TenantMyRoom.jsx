import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function TenantMyRoom() {
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [payments, setPayments] = useState({ due: 0, lastPaid: null });

  
  const formatRand = (amount) =>
    new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser?.id) setUser(storedUser);
      else { setError("User not logged in."); setLoading(false); }
    } catch { setError("Failed to load user data."); setLoading(false); }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      try {
        const [roomRes, complaintsRes, paymentsRes] = await Promise.all([
          axios.get(`http://localhost:3000/api/my-room/${user.id}`),
          axios.get(`http://localhost:3000/api/my-complaints/${user.id}`),
          axios.get(`http://localhost:3000/api/my-payments/${user.id}`)
        ]);
        setRoom(roomRes.data.listings?.[0] || null);
        setComplaints(Array.isArray(complaintsRes.data) ? complaintsRes.data : []);
        setPayments(paymentsRes.data || { due: 0, lastPaid: null });
      } catch (err) {
        console.error(err);
        setError("Failed to load data from server.");
      } finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  if (loading) return <p style={loadingStyle}>Loading Dashboard...</p>;
  if (error) return <p style={errorStyle}>{error}</p>;
  if (!room) return <p style={infoStyle}>You do not have a room assigned yet.</p>;

  
  const paymentChartData = {
    labels: Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d.toLocaleString("default", { month: "short" });
    }),
    datasets: [
      { label: "Payments", data: [100, 200, 150, 250, 300, 200], backgroundColor: "#6C63FF" }
    ]
  };
  const paymentChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => formatRand(context.raw)
        }
      }
    }
  };

  const complaintTypes = complaints.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {});
  const complaintChartData = {
    labels: Object.keys(complaintTypes),
    datasets: [
      { data: Object.values(complaintTypes), backgroundColor: ["#EF4444", "#F59E0B", "#10B981", "#6366F1", "#F43F5E"] }
    ]
  };

  return (
    <div style={container}>
      <h2 style={welcome}>Hello, {user?.name || "Tenant"} 👋</h2>

      {/* Quick Stats */}
      <div style={statsRow}>
        <div style={{...statCard, borderLeft: "6px solid #6C63FF"}}>
          <h4>Outstanding</h4>
          <p>{formatRand(payments.due)}</p>
        </div>
        <div style={{...statCard, borderLeft: "6px solid #10B981"}}>
          <h4>Complaints</h4>
          <p>{complaints.length}</p>
        </div>
        <div style={{...statCard, borderLeft: "6px solid #EF4444"}}>
          <h4>Last Paid</h4>
          <p>{payments.lastPaid ? new Date(payments.lastPaid).toLocaleDateString() : "N/A"}</p>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div style={dashboardGrid}>
        {/* Room Info + Complaint Buttons */}
        <div style={card}>
          <h3>Room Info</h3>
          <p><strong>Title:</strong> {room.title}</p>
          <p><strong>Location:</strong> {room.location}</p>
          <p><strong>Price:</strong> {formatRand(room.price)}</p>

          <h4 style={{marginTop:"1rem"}}>Report Complaint</h4>
          <div style={{display:"flex", flexWrap:"wrap", gap:"0.5rem"}}>
            {["Lights","Water","Heating","Noise","Other"].map(type => (
              <button key={type} style={buttonStyle} onClick={async()=>{
                try {
                  const res = await axios.post("http://localhost:3000/api/complaints", { tenantId: user.id, listingId: room.id, type, urgent:false });
                  setComplaints(prev => [...prev, res.data]);
                } catch { alert("Failed to submit complaint"); }
              }}>{type}</button>
            ))}
          </div>
        </div>

        {/* Payments Chart */}
        <div style={card}>
          <h3>Payments History</h3>
          <Bar data={paymentChartData} options={paymentChartOptions}/>
        </div>

        {/* Complaints Pie Chart */}
        <div style={card}>
          <h3>Complaints Breakdown</h3>
          {complaints.length===0 ? <p>No complaints yet</p> : 
            <Pie data={complaintChartData} options={{responsive:true, plugins:{legend:{position:"bottom"}}}}/>
          }
        </div>
      </div>
    </div>
  );
}


const container = { padding:"2rem", fontFamily:"'Poppins', sans-serif", background:"#F3F4F6" };
const welcome = { marginBottom:"1rem", color:"#111827" };
const statsRow = { display:"flex", gap:"1rem", marginBottom:"1.5rem", flexWrap:"wrap" };
const statCard = { flex:1, background:"#fff", padding:"1rem 1.5rem", borderRadius:"10px", boxShadow:"0 5px 15px rgba(0,0,0,0.08)", textAlign:"center", fontWeight:"500" };
const dashboardGrid = { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:"1rem" };
const card = { background:"#fff", padding:"1rem", borderRadius:"12px", boxShadow:"0 8px 20px rgba(0,0,0,0.08)" };
const buttonStyle = { padding:"0.5rem 0.75rem", borderRadius:"8px", border:"none", backgroundColor:"#6C63FF", color:"#fff", cursor:"pointer", fontWeight:500, transition:"0.2s", flex:"1 0 40%" };
const loadingStyle = { color:"#6C63FF", fontSize:"1.2rem", textAlign:"center", marginTop:"2rem" };
const errorStyle = { color:"#EF4444", fontSize:"1.1rem", textAlign:"center", marginTop:"2rem" };
const infoStyle = { color:"#6B7280", fontSize:"1.1rem", textAlign:"center", marginTop:"2rem" };

export default TenantMyRoom;