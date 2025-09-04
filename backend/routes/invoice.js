const express = require("express");
const fs = require("fs");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const pdfParse = require("pdf-parse");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { OpenAI } = require("openai");

const Invoice = require("../models/db.js");

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
});

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.array("files", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No files uploaded",
      });
    }

    const invoices = [];

    for (const file of req.files) {
      let text = "";

      // for PDF
      if (file.mimetype === "application/pdf") {
        try {
          const data = fs.readFileSync(file.path);
          const parsed = await pdfParse(data);
          text = parsed.text;
        } catch (err) {
          console.error("PDF parsing error:", err);
        }
      } else {
        // for Image
        try {
          const ocrResult = await Tesseract.recognize(file.path, "eng");
          text = ocrResult.data.text;
        } catch (err) {
          console.error("OCR error:", err);
        }
      }

      // Extract invoice data
      const vendor = text.match(/^(.*?Inc\.)/m)?.[1] || "Unknown";
      const invoiceNumber = text.match(/Invoice\s*#\s*([A-Za-z0-9-]+)/i)?.[1];
      const invoiceDate = text.match(/Invoice\s*Date\s*:?\s*([0-9\/-]+)/i)?.[1];
      const dueDate = text.match(/Due\s*Date\s*:?\s*([0-9\/-]+)/i)?.[1];
      const totalAmount = parseFloat(
        text.match(/TOTAL\s*\$?\s*([0-9.,]+)/i)?.[1]?.replace(/,/g, "")
      );

      const invoice = await Invoice.create({
        vendor,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        due_date: dueDate,
        total: totalAmount,
        rawText: text,
        filename: file.originalname,
        uploadDate: new Date(),
      });

      invoices.push({
        vendor: invoice.vendor,
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        total: invoice.total,
      });
    }

    res.status(200).json({
      success: true,
      message: "Files processed successfully",
      invoices,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server crash");
  }
});

router.post("/chat", async (req, res) => {
  try {
    const { question, invoiceId } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: "Question is required",
      });
    }

    let answer = "";

    if (invoiceId) {
      const invoiceData = await Invoice.findById(invoiceId);

      if (!invoiceData) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found. Please upload an invoice first.",
        });
      }

      async function getAIResponse(invoiceData, question) {
        try {
          const prompt = `You are an invoice assistant. Below is text extracted from an invoice:"${invoiceData.rawText}"

          Please answer the following question based on the invoice: "${question}"

          If the information is not available in the invoice, respond with "I couldn't find that information in the invoice."
          Provide a helpful and concise answer:
          `;

          const completion = await openai.chat.completions.create({
            model: "openai/gpt-oss-120b:free",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful invoice assistant that answers questions about invoices.",
              },
              { role: "user", content: prompt },
            ],
            max_tokens: 500,
          });

          return completion.choices[0].message.content;
        } catch (error) {
          console.error("OpenRouter API error:", error);
          return "AI service is currently unavailable. Please try again later.";
        }
      }

      answer = await getAIResponse(invoiceData, question);
      answer = answer.trim().replace(/[*_`]/g, "");

      return res.json({
        success: true,
        answer,
        invoiceId: invoiceData._id,
      });
    }

    const invoices = await Invoice.find();

    // Q1: How many invoices are due in the next 7 days?
    if (/due in the next 7 days/i.test(question)) {
      const today = new Date();
      const sevenDays = new Date();
      sevenDays.setDate(today.getDate() + 7);

      const dueInvoices = invoices.filter((invoice) => {
        if (!invoice.due_date) return false;

        const due = new Date(invoice.due_date);
        return due >= today && due <= sevenDays;
      });

      answer = `${dueInvoices.length} invoice(s) due in the next 7 days: `;

      answer += dueInvoices
        .map((inv) => {
          const dueDate = new Date(inv.due_date).toDateString();
          return `${inv.vendor}, due ${dueDate}, $${inv.total.toFixed(2)}`;
        })
        .join(" | ");

      return res.status(200).json({
        success: true,
        answer,
      });
    }

    // Q2: What is the total value of the invoice from Microsoft ?
    const vendorMatch = question.match(/invoice from ([A-Za-z0-9\s]+)/i);
    if (vendorMatch) {
      const vendorName = vendorMatch[1].trim();
      const vendorInvoice = invoices.find(
        (inv) =>
          inv.vendor &&
          inv.vendor.toLowerCase().includes(vendorName.toLowerCase())
      );

      if (vendorInvoice) {
        answer = `The total value of the invoice from ${vendorInvoice.vendor} is $${vendorInvoice.total.toFixed(2)}`;
      } else {
        answer = `No invoice found for vendor ${vendorName}`;
      }

      return res.status(200).json({
        success: true,
        answer,
      });
    }

    // Q3: List all vendors with invoices > $2,000.
    const amountMatch = question.match(/invoices? > \$?([0-9,]+)/i);
    if (amountMatch) {
      const threshold = parseFloat(amountMatch[1].replace(/,/g, ""));
      const highInvoices = invoices.filter((inv) => inv.total > threshold);

      if (highInvoices.length > 0) {
        answer = highInvoices
          .map((inv) => `${inv.vendor} ($${inv.total.toFixed(2)})`)
          .join(", ");
      } else {
        answer = `No invoices greater than $${threshold}`;
      }

      return res.status(200).json({
        success: true,
        answer,
      });
    }

    // Default fallback
    return res.json({
      success: true,
      answer:"I could not understand your query.",
    });
  } catch (err) {
    console.log("Chat error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

module.exports = router;
