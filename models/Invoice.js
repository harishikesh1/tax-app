const mongoose = require('mongoose');
// invoice schema model
const InvoiceSchema = new mongoose.Schema({
    currentDate: { type: Date },
    dueDate: { type: Date },
    invoiceNumber: { type: Number },

    
    billFrom: {
        companyName: { type: String },
        name: { type: String },
        gstin: { type: String },
        address: { type: String },
        city: { type: String },
        zip: { type: String },
    },
    billTo: {
        companyName: { type: String },
        name: { type: String },
        gstin: { type: String },
        address: { type: String },
        city: { type: String },
        zip: { type: String },
    },


    items: [
        {
            name: { type: String },
            quantity: { type: Number },
            rate: { type: Number },
            sgst: { type: Number },
            cgst: { type: Number },
            cess: { type: Number },
            amount: { type: Number },
        },
    ],

    subtotal: { type: Number },
    tax: { type: Number },
    total: { type: Number },
    terms: { type: String, default: 'Please make the payment by the due date.' },
    customId: {
        type: String,
        unique: true,
    },
},
    { timestamps: true });


module.exports = mongoose.model('Invoice', InvoiceSchema);
