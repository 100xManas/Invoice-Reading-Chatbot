const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const invoiceRoutes = require("./routes/invoice.js")

const app = express()
app.use(cors())
app.use(express.json()) // parse, JSON data along with the request.

const port = 8080

mongoose
  .connect("mongodb://localhost:27017/InvoiceDB")
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));


app.use("/api/invoices", invoiceRoutes)

app.get("/", (req, res)=>{
    res.send("Server running");
})

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
})