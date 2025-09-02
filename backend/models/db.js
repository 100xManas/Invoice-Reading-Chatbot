const mongoose = require("mongoose")

const invoiceSchema = new mongoose.Schema({
    invoiceNumber:String,
    date:String,
    totalAmount:Number,
    vender:String,
    rawText:String
})

module.exports = mongoose.model("invoice", invoiceSchema)