const express = require("express");
const cors = require("cors");

const authRoutes=require('./authroutes');
const listingRoutes = require('./listingroutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use("uploads");

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);

export default app;