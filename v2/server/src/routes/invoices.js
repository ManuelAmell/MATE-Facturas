const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

/**
 * Rutas de Facturas
 * /api/invoices
 */

// GET /api/invoices - Listar todas las facturas
router.get('/', invoiceController.getInvoices);

// GET /api/invoices/:id - Obtener factura por ID
router.get('/:id', invoiceController.getInvoiceById);

// POST /api/invoices - Crear nueva factura
router.post('/', invoiceController.createInvoice);

// PUT /api/invoices/:id - Actualizar factura
router.put('/:id', invoiceController.updateInvoice);

// PATCH /api/invoices/:id/status - Cambiar estado de factura
router.patch('/:id/status', invoiceController.updateInvoiceStatus);

// DELETE /api/invoices/:id - Eliminar (anular) factura
router.delete('/:id', invoiceController.deleteInvoice);

// GET /api/invoices/:id/pdf - Generar PDF
router.get('/:id/pdf', invoiceController.generatePDF);

module.exports = router;