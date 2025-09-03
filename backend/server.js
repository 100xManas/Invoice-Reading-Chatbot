const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const invoiceRoutes = require("./routes/invoice");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", invoiceRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server is running",
  });
});


mongoose
  .connect("mongodb://localhost:27017/InvoiceAppDB")
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

  
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});