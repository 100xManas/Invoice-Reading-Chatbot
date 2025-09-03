const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true },
  date: { type: String, required: true },
  totalAmount: { type: Number, required: true, min: 0 },
  vendor: { type: String, required: true },
  rawText: { type: String, required: true },
  filename: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Invoice", invoiceSchema);