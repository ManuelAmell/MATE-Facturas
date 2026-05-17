const crypto = require('crypto');
const QRCode = require('qrcode');
const dayjs = require('dayjs');

/**
 * Genera el CUFE (Código Único de Facturación Electrónica)
 * Según especificaciones DIAN
 * @param {Object} invoiceData - Datos de la factura
 * @returns {string} CUFE generado
 */
function generateCUFE(invoiceData) {
  const {
    invoice_number,
    issue_date,
    issue_time,
    total,
    iva_amount,
    base_iva,
    tax_identification,
    pin_technical,
    prefix = 'FE'
  } = invoiceData;

  const fecha = dayjs(issue_date).format('YYYYMMDD');
  const hora = issue_time ? dayjs(issue_time).format('HHmmss') : '000000';
  const valorTotal = Math.round(parseFloat(total) || 0);
  const valorIVA = Math.round(parseFloat(iva_amount) || 0);
  const baseImponible = Math.round(parseFloat(base_iva) || 0);

  // Construir string para hash SHA-256
  const cufeString = [
    prefix,
    invoice_number,
    fecha,
    hora,
    tax_identification || '',
    valorTotal,
    baseImponible,
    valorIVA,
    pin_technical || ''
  ].join('');

  // Generar hash SHA-256
  const hash = crypto.createHash('sha256').update(cufeString).digest('hex');

  return hash.toUpperCase();
}

/**
 * Genera el código QR para la factura
 * @param {Object} invoiceData - Datos de la factura
 * @param {string} validationUrl - URL de validación
 * @returns {string} Data URL de la imagen QR
 */
async function generateQR(invoiceData, validationUrl = 'https://catalogo-vpfe.dian.gov.co/document/search') {
  const {
    uuid,
    cufe,
    invoice_number,
    company_name,
    identification,
    total,
    iva_amount,
    issue_date
  } = invoiceData;

  const qrData = JSON.stringify({
    uuid,
    cufe,
    numero: invoice_number,
    empresa: company_name,
    nit: identification,
    total: parseFloat(total).toFixed(2),
    iva: parseFloat(iva_amount || 0).toFixed(2),
    fecha: dayjs(issue_date).format('YYYY-MM-DD'),
    url: validationUrl
  });

  try {
    const qrDataURL = await QRCode.toDataURL(qrData, {
      width: 150,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
    return qrDataURL;
  } catch (error) {
    console.error('Error generando QR:', error);
    return null;
  }
}

/**
 * Convierte número a texto (valor en letras)
 * @param {number} amount - Monto a convertir
 * @param {string} currency - Moneda
 * @returns {string} Monto en letras
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
  const currencyWord = currency === 'PESOS' ? 'PESOS' : currency;
  const result = words + currencyWord.toUpperCase() + (decimals > 0 ? ` CON ${decimals}/100` : ' 00/100');

  return result.toUpperCase();
}

/**
 * Calcula automáticamente los valores de una factura
 * @param {Array} items - Lista de items
 * @param {Object} options - Opciones de cálculo
 * @returns {Object} Valores calculados
 */
function calculateInvoiceTotals(items, options = {}) {
  const {
    discount_percent = 0,
    iva_rate = 19,
    retention_percent = 0
  } = options;

  let subtotal = 0;
  let total_discount = 0;
  let base_iva = 0;
  let total_iva = 0;

  items.forEach(item => {
    const quantity = parseFloat(item.quantity) || 0;
    const unit_price = parseFloat(item.unit_price) || 0;
    const item_discount_percent = parseFloat(item.discount_percent) || 0;

    const line_subtotal = quantity * unit_price;
    const line_discount = line_subtotal * (item_discount_percent / 100);
    const line_base_iva = line_subtotal - line_discount;
    const line_iva = line_base_iva * (parseFloat(item.iva_rate ?? iva_rate) / 100);
    const line_total = line_base_iva + line_iva;

    subtotal += line_subtotal;
    total_discount += line_discount;
    base_iva += line_base_iva;
    total_iva += line_iva;
  });

  const global_discount = subtotal * (discount_percent / 100);
  const subtotal_after_discount = subtotal - global_discount - total_discount;
  const base_iva_after_discount = subtotal_after_discount; // Simplified
  const iva_after_discount = base_iva_after_discount * (iva_rate / 100);
  const retention = subtotal_after_discount * (retention_percent / 100);
  const total = subtotal_after_discount + iva_after_discount - retention;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    total_discount: Math.round((total_discount + global_discount) * 100) / 100,
    base_iva: Math.round(base_iva_after_discount * 100) / 100,
    iva_amount: Math.round(iva_after_discount * 100) / 100,
    iva_rate,
    retention_amount: Math.round(retention * 100) / 100,
    total: Math.round(total * 100) / 100,
    total_letters: numberToWords(total, 'PESOS')
  };
}

/**
 * Genera el número de factura consecutivo
 * @param {Object} company - Datos de la empresa
 * @param {number} lastNumber - Último número usado
 * @returns {string} Número de factura formateado
 */
function generateInvoiceNumber(company, lastNumber) {
  const prefix = company.resolution_prefix || 'FE';
  const nextNumber = (lastNumber || company.resolution_from || 1) + 1;
  return `${prefix}${nextNumber.toString().padStart(8, '0')}`;
}

module.exports = {
  generateCUFE,
  generateQR,
  numberToWords,
  calculateInvoiceTotals,
  generateInvoiceNumber
};