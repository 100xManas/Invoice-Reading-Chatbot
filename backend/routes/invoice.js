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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only PDF and images are allowed"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});


router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    let text = "";

    // Process PDF files
    if (req.file.mimetype === "application/pdf") {
      try {
        const data = fs.readFileSync(req.file.path);
        const parsed = await pdfParse(data);
        text = parsed.text;
      } catch (err) {
        console.error("PDF parsing error:", err);
        return res.status(500).json({
          success: false,
          error: "Failed to parse PDF file",
        });
      }
    } else {
      // Process image files
      try {
        const ocrResult = await Tesseract.recognize(req.file.path, "eng");
        text = ocrResult.data.text;
      } catch (err) {
        console.error("OCR error:", err);
        return res.status(500).json({
          success: false,
          error: "Failed to process image with OCR",
        });
      }
    }

    // Extract basic invoice data using simple regex
    const invoiceNumber =
      text.match(/invoiceNumber\s*#?:?\s*(\w+)/i)?.[1] || "N/A";
    const date = text.match(/Date\s*:?\s*([0-9\/-]+)/i)?.[1] || "N/A";
    const totalAmount =
      parseFloat(text.match(/Total\s*:?\s*\$?([0-9.,]+)/i)?.[1]) || 0;
    const vendor = text.match(/Vendor\s*:?\s*(.*)/i)?.[1] || "Unknown";

    // Create invoice data object
    const invoiceData = {
      invoiceNumber,
      date,
      totalAmount,
      vendor,
      rawText: text,
      filename: req.file.originalname,
      filePath: req.file.path,
      uploadDate: new Date(),
    };

    // Save to database
    const invoice = new Invoice(invoiceData);
    await invoice.save();

    // Send response
    res.status(200).json({
      success: true,
      message: "File processed successfully",
      invoice: {
        id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        date: invoice.date,
        totalAmount: invoice.totalAmount,
        vendor: invoice.vendor,
        filename: invoice.filename,
      },
    });
  } catch (err) {
    console.error("Error processing file:", err);

    res.status(500).json({
      success: false,
      error: "Failed to process file",
    });
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

    if (!invoiceId) {
      return res.status(400).json({
        success: false,
        error: "Invoice ID is required",
      });
    }

    let answer;
    let invoiceData = null;

    // Find the invoice by ID
    invoiceData = await Invoice.findById(invoiceId);

    // console.log(invoiceData.rawText);
    // console.log(question);

    if (!invoiceData) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found. Please upload an invoice first.",
      });
    }

    // AI response function
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

        // ✅ Return AI text content
        console.log(completion.choices[0].message.content);
        
        return completion.choices[0].message.content;
      } catch (error) {
        console.error("OpenRouter API error:", error);
        return "AI service is currently unavailable. Please try again later.";
      }
    }

    answer = await getAIResponse(invoiceData, question);
    let readableAnswer = answer.replace(/[*_`]/g, "").trim();
    // console.log(readableAnswer);

    res.json({
      success: true,
      answer: readableAnswer,
      invoiceId: invoiceData._id,
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to process question",
    });
  }
});

module.exports = router;
