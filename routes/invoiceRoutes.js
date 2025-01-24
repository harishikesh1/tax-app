const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// View Routes
router.get('/', invoiceController.home);
router.get('/invoices', invoiceController.getAllInvoices);
router.get('/invoices/:id', invoiceController.getInvoiceById);

// API Routes
router.post('/api/invoices', invoiceController.createInvoice);
router.put('/api/invoices/:customId', invoiceController.updateInvoice);
router.delete('/api/invoices/:customId', invoiceController.deleteInvoice);
router.get('/generate-pdf', invoiceController.generatePDF);

module.exports = router;
