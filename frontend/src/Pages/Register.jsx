import { useState } from "react";
import API from './api/api.js';

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("TENANT"); // default role

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/register", {
        email,
        password,
        role
      });
      alert("User registered successfully!");
      console.log(res.data);
    } catch (err) {
      console.error(err);
      alert("Error registering user");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="TENANT">Tenant</option>
          <option value="LANDLORD">Landlord</option>
        </select>
        <br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;