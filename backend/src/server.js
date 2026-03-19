import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();


app.use(cors({ origin: true, credentials: true }));
app.use(express.json());


app.get("/", (req, res) => res.send("Backend is running!"));


app.post("/register", async (req, res) => {
  let { email, password, role } = req.body;
  if (!email || !password || !role) return res.status(400).json({ message: "All fields required" });

  try {
    role = role.toUpperCase();
    if (!["TENANT", "LANDLORD"].includes(role)) return res.status(400).json({ message: "Invalid role" });

    const user = await prisma.user.create({ data: { email, password, role } });
    res.status(201).json({ message: "User created", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating user" });
  }
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "All fields required" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.password !== password) return res.status(401).json({ message: "Invalid password" });

    res.json({ message: "Login successful", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error logging in" });
  }
});


app.get("/api/my-room/:userId", async (req, res) => {
  try {
    const tenantId = req.params.userId;
    const listings = await prisma.listing.findMany({ where: { tenantId } });
    res.json({ listings: listings || [] });
  } catch (err) {
    console.error("Error fetching tenant room:", err);
    res.status(500).json({ message: "Error fetching tenant room" });
  }
});


app.get("/api/my-complaints/:userId", async (req, res) => {
  try {
    const tenantId = req.params.userId;
    const complaints = await prisma.complaint.findMany({
      where: { tenantId },
      orderBy: { timestamp: "desc" },
      select: { id: true, type: true, urgent: true, timestamp: true, listingId: true },
    });
    res.json(complaints || []);
  } catch (err) {
    console.error("Error fetching tenant complaints:", err);
    res.status(500).json({ message: "Error fetching tenant complaints" });
  }
});


app.get("/api/my-payments/:userId", async (req, res) => {
  try {
    const tenantId = req.params.userId;
    const payments = await prisma.payment.findMany({
      where: { tenantId },
      orderBy: { dueDate: "desc" },
    });

    const totalDue = payments.filter(p => !p.paidDate).reduce((sum, p) => sum + (p.amount || 0), 0);
    const lastPaid = payments.filter(p => p.paidDate)
                             .sort((a, b) => new Date(b.paidDate) - new Date(a.paidDate))[0]?.paidDate || null;

    res.json({ due: totalDue, lastPaid });
  } catch (err) {
    console.error("Error fetching tenant payments:", err);
    res.status(500).json({ message: "Error fetching tenant payments" });
  }
});


app.get("/api/landlord-listings/:userId", async (req, res) => {
  try {
    const ownerId = req.params.userId;
    const listings = await prisma.listing.findMany({ where: { ownerId } });
    res.json({ listings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
});


app.get("/api/tenants", async (req, res) => {
  try {
    const tenants = await prisma.user.findMany({
      where: { role: "TENANT" },
      select: { id: true, email: true },
    });
    res.json({ users: tenants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch tenants" });
  }
});


app.put("/api/assign-tenant/:listingId", async (req, res) => {
  const { listingId } = req.params;
  const { tenantId } = req.body;
  try {
    const updatedListing = await prisma.listing.update({ where: { id: listingId }, data: { tenantId } });
    res.json({ listing: updatedListing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to assign tenant" });
  }
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));