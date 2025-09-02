const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json()) // parse, JSON data along with the request.

const port = 8080

mongoose.connect("mongodb://localhost:27017/InvoiceDB")

app.get("/", (req, res)=>{
    res.send("Server running");
})

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
})