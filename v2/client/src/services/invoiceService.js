const API_URL = '/api';

/**
 * Obtiene los datos mock (demo)
 */
async function getMockData() {
  try {
    const response = await fetch(`${API_URL}/mock/data`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching mock data:', error);
    return null;
  }
}

/**
 * Obtiene todas las facturas
 */
async function getInvoices(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/invoices?${queryString}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return { success: false, data: [] };
  }
}

/**
 * Obtiene una factura por ID
 */
async function getInvoiceById(id) {
  try {
    const response = await fetch(`${API_URL}/invoices/${id}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return { success: false };
  }
}

/**
 * Crea una nueva factura
 */
async function createInvoice(invoiceData) {
  try {
    const response = await fetch(`${API_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invoiceData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating invoice:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Actualiza una factura
 */
async function updateInvoice(id, invoiceData) {
  try {
    const response = await fetch(`${API_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invoiceData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating invoice:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Anula una factura
 */
async function cancelInvoice(id, reason = '') {
  try {
    const response = await fetch(`${API_URL}/invoices/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    });
    return await response.json();
  } catch (error) {
    console.error('Error cancelling invoice:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Descarga el PDF de una factura
 */
async function downloadPDF(id) {
  try {
    const response = await fetch(`${API_URL}/invoices/${id}/pdf`);
    if (!response.ok) throw new Error('Error al generar PDF');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factura-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();

    return { success: true };
  } catch (error) {
    console.error('Error downloading PDF:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Convierte número a palabras (valor en letras)
 */
function numberToWords(amount, currency = 'PESOS') {
  const num = Math.abs(Math.round(amount));
  const unidades = ['', 'UN ', 'DOS ', 'TRES ', 'CUATRO ', 'CINCO ', 'SEIS ', 'SIETE ', 'OCHO ', 'NUEVE '];
  const decenas = ['', 'DIEZ ', 'VEINTE ', 'TREINTA ', 'CUARENTA ', 'CINCUENTA ', 'SESENTA ', 'SETENTA ', 'OCHENTA ', 'NOVENTA '];
  const centenas = ['', 'CIENTO ', 'DOSCIENTOS ', 'TRESCIENTOS ', 'CUATROCIENTOS ', 'QUINIENTOS ', 'SEISCIENTOS ', 'SETECIENTOS ', 'OCHOCIENTOS ', 'NOVECIENTOS '];

  if (num === 0) return 'CERO ';

  function convertGroup(n) {
    if (n < 10) return unidades[n];
    if (n < 20) {
      const teens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
      return teens[n - 10] + ' ';
    }
    if (n < 100) {
      const tens = Math.floor(n / 10);
      const ones = n % 10;
      return decenas[tens] + (ones > 0 ? 'Y ' + unidades[ones] : '');
    }
    if (n < 1000) {
      const hundreds = Math.floor(n / 100);
      const remainder = n % 100;
      return centenas[hundreds] + (remainder > 0 ? convertGroup(remainder) : '');
    }
    if (n < 1000000) {
      const thousands = Math.floor(n / 1000);
      const remainder = n % 1000;
      return (thousands === 1 ? 'MIL ' : convertGroup(thousands) + 'MIL ') + (remainder > 0 ? convertGroup(remainder) : '');
    }
    if (n < 1000000000) {
      const millions = Math.floor(n / 1000000);
      const remainder = n % 1000000;
      return (millions === 1 ? 'UN MILLON ' : convertGroup(millions) + 'MILLONES ') + (remainder > 0 ? convertGroup(remainder) : '');
    }
    return '';
  }

  const integerPart = Math.floor(num);
  const decimals = Math.round((num - integerPart) * 100);
  const words = convertGroup(integerPart).trim();
  const result = words + (decimals > 0 ? ` CON ${decimals}/100` : ' 00/100');

  return result.toUpperCase();
}

/**
 * Formatea moneda
 */
function formatCurrency(amount, currency = 'COP') {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Formatea fecha
 */
function formatDate(date, format = 'DD/MM/YYYY') {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Calcula los totales de la factura
 */
function calculateTotals(items, discountPercent = 0) {
  let subtotal = 0;
  let totalDiscount = 0;
  let baseIva = 0;
  let totalIva = 0;

  items.forEach(item => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    const itemDiscount = parseFloat(item.discount_percent) || 0;
    const ivaRate = parseFloat(item.iva_rate ?? 0);

    const lineSubtotal = quantity * unitPrice;
    const lineDiscount = lineSubtotal * (itemDiscount / 100);
    const lineBaseIva = lineSubtotal - lineDiscount;
    const lineIva = lineBaseIva * (ivaRate / 100);

    subtotal += lineSubtotal;
    totalDiscount += lineDiscount;
    baseIva += lineBaseIva;
    totalIva += lineIva;
  });

  const globalDiscount = subtotal * (discountPercent / 100);
  const totalDiscountAll = totalDiscount + globalDiscount;
  const subtotalAfterDiscount = subtotal - totalDiscountAll;
  const total = subtotalAfterDiscount + totalIva;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalDiscount: Math.round(totalDiscountAll * 100) / 100,
    baseIva: Math.round(baseIva * 100) / 100,
    ivaAmount: Math.round(totalIva * 100) / 100,
    total: Math.round(total * 100) / 100,
    totalLetters: numberToWords(total, 'PESOS')
  };
}

/**
 * Descarga el PDF de una factura (alias)
 */
export async function downloadInvoicePDF(id) {
  return await downloadPDF(id);
}

export const invoiceService = {
  getMockData,
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  cancelInvoice,
  downloadPDF,
  downloadInvoicePDF,
  numberToWords,
  formatCurrency,
  formatDate,
  calculateTotals
};