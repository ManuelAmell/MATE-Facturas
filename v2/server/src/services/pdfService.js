const jsPDF = require('jspdf');
require('jspdf-autotable');
const path = require('path');

/**
 * Genera un buffer PDF de la factura
 * @param {Object} invoice - Factura con relaciones
 * @returns {Buffer} Buffer del PDF
 */
async function generatePDFBuffer(invoice) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ============================================
  // HEADER
  // ============================================

  // Company Name
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.company?.name || 'Nombre de la Empresa', 15, 20);

  // Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA ELECTRÓNICA DE VENTA', pageWidth - 15, 15, { align: 'right' });

  // Invoice Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`No. ${invoice.invoice_number}`, pageWidth - 15, 22, { align: 'right' });
  doc.text(`Fecha: ${new Date(invoice.issue_date).toLocaleDateString('es-CO')}`, pageWidth - 15, 28, { align: 'right' });
  doc.text(`Estado: ${invoice.status.toUpperCase()}`, pageWidth - 15, 34, { align: 'right' });

  // Resolution Info
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(`Resolución: ${invoice.company?.resolution_number || 'N/A'}`, 15, 42);
  doc.text(`CUFE: ${invoice.cufe || 'N/A'}`, 15, 47);

  // ============================================
  // COMPANY INFO
  // ============================================

  let yPos = 55;
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('EMISOR', 15, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 7;
  doc.text(`NIT: ${invoice.company?.nit || ''}`, 15, yPos);
  yPos += 5;
  doc.text(`Dirección: ${invoice.company?.address || ''}`, 15, yPos);
  yPos += 5;
  doc.text(`Teléfono: ${invoice.company?.phone || ''}`, 15, yPos);
  yPos += 5;
  doc.text(`Email: ${invoice.company?.email || ''}`, 15, yPos);

  // ============================================
  // CUSTOMER INFO
  // ============================================

  yPos += 12;
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE', 15, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 7;
  doc.text(`Nombre: ${invoice.customer?.name || ''}`, 15, yPos);
  yPos += 5;
  doc.text(`NIT: ${invoice.customer?.identification || ''}`, 15, yPos);
  yPos += 5;
  doc.text(`Dirección: ${invoice.customer?.address || ''}`, 15, yPos);
  yPos += 5;
  doc.text(`Email: ${invoice.customer?.email || ''}`, 15, yPos);

  // ============================================
  // PAYMENT INFO
  // ============================================

  yPos += 12;
  doc.setFont('helvetica', 'bold');
  doc.text('PAGO', 15, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 7;
  doc.text(`Forma: ${invoice.payment_form || 'Contado'}`, 15, yPos);
  doc.text(`Método: ${invoice.payment_method || 'Efectivo'}`, 80, yPos);
  yPos += 5;
  doc.text(`Moneda: ${invoice.currency || 'COP'}`, 15, yPos);

  // ============================================
  // ITEMS TABLE
  // ============================================

  yPos += 12;

  const tableData = (invoice.items || []).map((item, index) => [
    index + 1,
    item.code || '',
    item.description.substring(0, 30),
    item.quantity,
    item.unit,
    item.unit_price.toFixed(2),
    `${item.iva_rate}%`,
    item.total.toFixed(2)
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['#', 'Código', 'Descripción', 'Cant', 'Unidad', 'P. Unit', 'IVA', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 20 },
      2: { cellWidth: 50 },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 15, halign: 'center' },
      7: { cellWidth: 25, halign: 'right' }
    }
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // ============================================
  // TOTALS
  // ============================================

  const totalsX = pageWidth - 60;

  doc.setFontSize(10);
  doc.text('Subtotal:', totalsX, yPos);
  doc.text(`$${invoice.subtotal.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });
  yPos += 6;

  if (invoice.discount_amount > 0) {
    doc.setTextColor(200, 0, 0);
    doc.text('Descuento:', totalsX, yPos);
    doc.text(`-$${invoice.discount_amount.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });
    doc.setTextColor(0);
    yPos += 6;
  }

  doc.text('IVA:', totalsX, yPos);
  doc.text(`$${invoice.iva_amount.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });
  yPos += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', totalsX, yPos);
  doc.text(`$${invoice.total.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });

  // ============================================
  // VALUE IN WORDS
  // ============================================

  yPos += 15;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Valor en Letras:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.total_letters || '', 15, yPos + 6);

  // ============================================
  // FOOTER
  // ============================================

  doc.setFontSize(8);
  doc.setTextColor(128);
  doc.text('Documento generado por sistema MATE Facturas', pageWidth / 2, 280, { align: 'center' });
  doc.text(`Software ID: ${invoice.company?.software_id || 'N/A'}`, pageWidth / 2, 285, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
}

module.exports = {
  generatePDFBuffer
};