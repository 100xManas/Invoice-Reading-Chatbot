const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  vendor: { type: String, required: true },
  invoice_number: { type: String, required: true },
  invoice_date: { type: Date, required: true },
  due_date: { type: Date, required: true },
  total: { type: Number, required: true, min: 0 },
  rawText: { type: String, required: true },
  filename: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Invoice", invoiceSchema);