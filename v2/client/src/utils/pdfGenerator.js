import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Genera un PDF de la factura
 */
export function generateInvoicePDF(invoiceData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ============================================
  // HEADER
  // ============================================

  // Logo
  try {
    doc.addImage('/logo.jpeg', 'JPEG', 15, 10, 30, 20);
  } catch (e) {
    console.log('Logo no encontrado');
  }

  // Company Name
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(invoiceData.company?.name || 'Nombre de la Empresa', 50, 18);

  // Title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA ELECTRÓNICA DE VENTA', pageWidth - 15, 15, { align: 'right' });

  // Invoice Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`No. ${invoiceData.invoice_number}`, pageWidth - 15, 22, { align: 'right' });
  doc.text(`Fecha: ${invoiceData.issue_date}`, pageWidth - 15, 28, { align: 'right' });
  doc.text(`Validación: ${new Date().toLocaleString('es-CO')}`, pageWidth - 15, 34, { align: 'right' });

  // Resolution Info
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(`Resolución DIAN: ${invoiceData.company?.resolution_number || 'N/A'}`, pageWidth - 15, 40, { align: 'right' });
  doc.text(`Régimen: ${invoiceData.company?.regimen || 'Común'}`, pageWidth - 15, 45, { align: 'right' });

  // ============================================
  // COMPANY INFO
  // ============================================

  let yPos = 55;
  doc.setTextColor(0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('EMISOR', 15, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 6;
  doc.text(`Nombre: ${invoiceData.company?.name || ''}`, 15, yPos);
  yPos += 5;
  doc.text(`NIT: ${invoiceData.company?.nit || ''}`, 15, yPos);
  yPos += 5;
  doc.text(`Dirección: ${invoiceData.company?.address || ''}`, 15, yPos);
  yPos += 5;
  doc.text(`Teléfono: ${invoiceData.company?.phone || ''}`, 15, yPos);

  // ============================================
  // CUSTOMER INFO
  // ============================================

  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE', 15, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 6;
  doc.text(`Nombre: ${invoiceData.customer?.name || ''}`, 15, yPos);
  yPos += 5;
  doc.text(`NIT: ${invoiceData.customer?.identification || ''}`, 15, yPos);
  yPos += 5;
  doc.text(`Dirección: ${invoiceData.customer?.address || ''}`, 15, yPos);
  yPos += 5;
  doc.text(`Email: ${invoiceData.customer?.email || ''}`, 15, yPos);

  // ============================================
  // PAYMENT INFO
  // ============================================

  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DE PAGO', 15, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 6;
  doc.text(`Forma de Pago: ${invoiceData.payment_form || 'Contado'}`, 15, yPos);
  yPos += 5;
  doc.text(`Método de Pago: ${invoiceData.payment_method || 'Efectivo'}`, 15, yPos);
  yPos += 5;
  doc.text(`Moneda: ${invoiceData.currency || 'COP'}`, 15, yPos);

  // ============================================
  // ITEMS TABLE
  // ============================================

  yPos += 10;

  const tableData = (invoiceData.items || []).map((item, index) => [
    index + 1,
    item.code || '',
    item.description || '',
    item.quantity,
    item.unit || 'UND',
    (Number(item.unit_price) || 0).toFixed(2),
    `${Number(item.iva_rate) || 0}%`,
    (Number(item.subtotal) || 0).toFixed(2),
    (Number(item.total) || 0).toFixed(2)
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['#', 'Código', 'Descripción', 'Cant', 'Unidad', 'P. Unit', 'IVA', 'Subtotal', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [60, 60, 60],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 8
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 20 },
      2: { cellWidth: 45 },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 12, halign: 'center' },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: 12, halign: 'center' },
      7: { cellWidth: 18, halign: 'right' },
      8: { cellWidth: 18, halign: 'right' }
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    }
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // ============================================
  // TOTALS
  // ============================================

  const totalsX = pageWidth - 70;
  const totalsWidth = 65;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Subtotal
  doc.text('Subtotal:', totalsX, yPos);
  doc.text(`$${(Number(invoiceData.subtotal) || 0).toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });
  yPos += 6;

  // Discount
  if (Number(invoiceData.discount_amount) > 0) {
    doc.text('Descuentos:', totalsX, yPos);
    doc.setTextColor(200, 0, 0);
    doc.text(`-$${(Number(invoiceData.discount_amount) || 0).toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });
    doc.setTextColor(0);
    yPos += 6;
  }

  // Base IVA
  doc.text('Base IVA:', totalsX, yPos);
  doc.text(`$${(Number(invoiceData.base_iva) || 0).toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });
  yPos += 6;

  // IVA
  doc.text('IVA (19%):', totalsX, yPos);
  doc.text(`$${(Number(invoiceData.iva_amount) || 0).toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });
  yPos += 8;

  // Total
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL A PAGAR:', totalsX, yPos);
  doc.setTextColor(0, 0, 0);
  doc.text(`$${(Number(invoiceData.total) || 0).toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });

  // ============================================
  // VALUE IN WORDS
  // ============================================

  yPos += 15;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Valor en Letras:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.total_letters || '', 15, yPos + 5);

  // ============================================
  // NOTES AND TERMS
  // ============================================

  if (invoiceData.notes || invoiceData.terms) {
    yPos += 20;
    if (invoiceData.notes) {
      doc.setFont('helvetica', 'bold');
      doc.text('Notas:', 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(invoiceData.notes, 15, yPos + 5);
    }
    if (invoiceData.terms) {
      yPos += 15;
      doc.setFont('helvetica', 'bold');
      doc.text('Términos:', 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(invoiceData.terms, 15, yPos + 5);
    }
  }

  // ============================================
  // FOOTER
  // ============================================

  doc.setFontSize(8);
  doc.setTextColor(128);
  doc.text('Esta factura es un documento electrónico de venta según normativa DIAN.', pageWidth / 2, 280, { align: 'center' });

  return doc;
}

/**
 * Descarga el PDF de la factura
 */
export function downloadInvoicePDF(invoiceData, filename = 'factura.pdf') {
  const doc = generateInvoicePDF(invoiceData);
  doc.save(filename);
}