const Invoice = require('../models/Invoice');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');


 
exports.home = async (req, res) => {
  res.render('home',);
};

// Get all invoices
exports.getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find();
        res.render('invoices-list', { invoices });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a single invoice
exports.getInvoiceById = async (req, res) => {
    try {
        const customId = req.params.id;
        const invoice = await Invoice.findOne({ customId });
        if (!invoice) return res.status(404).send('Invoice not found');
        res.render('invoice-details', { invoice: invoice.toObject() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new invoice
exports.createInvoice = async (req, res) => {
    try {
        const customId = `INV-${uuidv4()}`;
        const newInvoice = new Invoice({ ...req.body, customId });
        const savedInvoice = await newInvoice.save();
        res.status(201).json(savedInvoice);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update an invoice
exports.updateInvoice = async (req, res) => {
    try {
        const customId = req.params.customId;
        const updatedInvoice = await Invoice.findOneAndUpdate({ customId }, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedInvoice) return res.status(404).json({ error: 'Invoice not found' });
        res.json(updatedInvoice);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete an invoice
exports.deleteInvoice = async (req, res) => {
    try {
        const customId = req.params.customId;
        const deletedInvoice = await Invoice.findOneAndDelete({ customId });
        if (!deletedInvoice) return res.status(404).json({ error: 'Invoice not found' });
        res.json({ message: 'Invoice deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Generate PDF for an invoice
exports.generatePDF = async (req, res) => {
    try {
        const customId = req.query.id;
        const invoice = await Invoice.findOne({ customId: customId });

        if (!invoice) {
            return res.status(404).send('Invoice not found');
        }

        const doc = new PDFDocument({
            size: 'A4', 
            margin: 40, 
        });

        // Set headers for PDF response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=invoice.pdf');

      
        doc.pipe(res);

        // Title and Invoice Details
        doc.fontSize(24).font('Helvetica-Bold').text('TAX INVOICE', { align: 'center' });
        doc.moveDown(0.5);

        doc.fontSize(12).font('Helvetica');
        doc.text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'right' });
        doc.text(`Date: ${new Date(invoice.currentDate).toLocaleDateString()}`, { align: 'right' });
        doc.text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}`, { align: 'right' });
        doc.moveDown(3);


        const startingY = doc.y;



        doc.font('Helvetica-Bold').fontSize(13).text('Bill From:', 20, startingY, { underline: true });
        doc.font('Helvetica');

        doc.font('Helvetica-Bold').fontSize(10).text('Company Name: ', 20, startingY + 20);
        doc.font('Helvetica').fontSize(10).text(invoice.billFrom.companyName || '', 105, startingY + 20);

        doc.font('Helvetica-Bold').fontSize(10).text('Name: ', 20, startingY + 40);
        doc.font('Helvetica').fontSize(10).text(invoice.billFrom.name || '', 55, startingY + 40);

        doc.font('Helvetica-Bold').fontSize(10).text('Address: ', 20, startingY + 60);
        doc.font('Helvetica').fontSize(10).text(invoice.billFrom.address || '', 70, startingY + 60);

        doc.font('Helvetica-Bold').fontSize(10).text('City: ', 20, startingY + 80);
        doc.font('Helvetica').fontSize(10).text(`${invoice.billFrom.city || ''}, ${invoice.billFrom.zip || ''}`, 50, startingY + 80);

        doc.font('Helvetica-Bold').fontSize(10).text('GSTIN: ', 20, startingY + 100);
        doc.font('Helvetica').fontSize(10).text(invoice.billFrom.gstin || 'N/A', 60, startingY + 100);

        doc.moveDown(2);

        const billToX = 320;

        doc.font('Helvetica-Bold').fontSize(13).text('Bill To:', billToX, startingY, { underline: true });
        doc.font('Helvetica');

        doc.font('Helvetica-Bold').fontSize(10).text('Company Name: ', billToX, startingY + 20);
        doc.font('Helvetica').fontSize(10).text(invoice.billTo.companyName || '', billToX + 85, startingY + 20);

        doc.font('Helvetica-Bold').fontSize(10).text('Name: ', billToX, startingY + 40);
        doc.font('Helvetica').fontSize(10).text(invoice.billTo.name || '', billToX + 35, startingY + 40);

        doc.font('Helvetica-Bold').fontSize(10).text('Address: ', billToX, startingY + 60);
        doc.font('Helvetica').fontSize(10).text(invoice.billTo.address || '', billToX + 50, startingY + 60);

        doc.font('Helvetica-Bold').fontSize(10).text('City: ', billToX, startingY + 80);
        doc.font('Helvetica').fontSize(10).text(`${invoice.billTo.city || ''}, ${invoice.billTo.zip || ''}`, billToX + 30, startingY + 80);

        doc.font('Helvetica-Bold').fontSize(10).text('GSTIN: ', billToX, startingY + 100);
        doc.font('Helvetica').fontSize(10).text(invoice.billTo.gstin || 'N/A', billToX + 40, startingY + 100);

        doc.moveDown(2);







        const headerY = doc.y;
        const columnPositions = {
            name: 20,
            quantity: 150,
            rate: 230,
            sgst: 300,
            cgst: 350,
            cess: 400,
            amount: 490,
        };

        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('Product Name', columnPositions.name, headerY, { width: 130, align: 'left' });
        doc.text('Quantity', columnPositions.quantity, headerY, { width: 80, align: 'right' });
        doc.text('Rate', columnPositions.rate, headerY, { width: 70, align: 'right' });
        doc.text('SGST', columnPositions.sgst, headerY, { width: 50, align: 'right' });
        doc.text('CGST', columnPositions.cgst, headerY, { width: 50, align: 'right' });
        doc.text('Cess', columnPositions.cess, headerY, { width: 50, align: 'right' });
        doc.text('Amount', columnPositions.amount, headerY, { width: 80, align: 'right' });

        doc.moveTo(20, doc.y + 0).lineTo(580, doc.y + 0).stroke();
        doc.moveDown(0.5);

        // Table Data
        let yPosition = doc.y;
        doc.font('Helvetica');
        invoice.items.forEach((item) => {
            doc.text(item.name || '-', columnPositions.name, yPosition, { width: 130, align: 'left' });
            doc.text(item.quantity?.toString() || '0', columnPositions.quantity, yPosition, { width: 80, align: 'right' });
            doc.text(item.rate?.toFixed(2) || '0.00', columnPositions.rate, yPosition, { width: 70, align: 'right' });
            doc.text(item.sgst ? `${item.sgst}%` : '0%', columnPositions.sgst, yPosition, { width: 50, align: 'right' });
            doc.text(item.cgst ? `${item.cgst}%` : '0%', columnPositions.cgst, yPosition, { width: 50, align: 'right' });
            doc.text(item.cess ? `${item.cess}%` : '0%', columnPositions.cess, yPosition, { width: 50, align: 'right' });
            doc.text(item.amount?.toFixed(2) || '0.00', columnPositions.amount, yPosition, { width: 80, align: 'right' });

            yPosition += 20;  
        });

        //   line after the table
        doc.moveTo(20, yPosition).lineTo(580, yPosition).stroke();
        doc.moveDown(1);

        // summary Section
        yPosition += 30;
        doc.text(`Subtotal: ${invoice.subtotal.toFixed(2)}`, 400, yPosition, { align: 'right' });
        doc.text(`Tax: ${invoice.tax.toFixed(2)}`, 400, yPosition + 20, { align: 'right' });
        doc.font('Helvetica-Bold');
        doc.text(`Total Amount (Including GST): ${invoice.total.toFixed(2)}`, 400, yPosition + 40, { align: 'right' });

      

       
        doc.end();
    } catch (err) {
        console.error('Error generating PDF:', err);
        res.status(500).send('Error generating PDF');
    }
};
