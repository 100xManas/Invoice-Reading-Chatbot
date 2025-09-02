const express = require("express");
const fs = require("fs");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const pdfParse = require("pdf-parse");
const Invoice = require("../models/db.js");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), async (req, res) => {
  let text = "";

  try {
    //for pdf
    if (req.file.mimetype === "application/pdf") {
      const data = fs.readFileSync(req.file.path);
      const parsed = await pdfParse(data);

      text = parsed.text;
    } else {
        // for image
        const res = await Tesseract.recognize(req.file.path, "eng")
        text = res.data.text
    }

    const invoiceData = {
      invoiceNumber: text.invoice,
      date: text.date,
      totalAmount: text.totalAmount || 0,
      vendor: text.vendor || "Unknown",
      rawText: text,
    };

    const invoice = new Invoice(invoiceData)
    await invoice.save()

    res.status(200).json({
      success: true,
      invoice
    });
  } catch (err) {
    console.error("Error parsing file:", err);
    res.status(500).json({
      success: false,
      err: "Failed to parse file",
    });
  }
});



