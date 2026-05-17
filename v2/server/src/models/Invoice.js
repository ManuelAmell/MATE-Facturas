const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  invoice_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Número de factura (consecutivo)'
  },
  uuid: {
    type: DataTypes.STRING(36),
    allowNull: false,
    unique: true,
    comment: 'UUID único de la factura electrónica'
  },
  cufe: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Código único de facturación electrónica'
  },
  prefix: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Prefijo de la factura (ej: FE)'
  },
  issue_date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha de emisión'
  },
  issue_time: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'Hora de emisión'
  },
  validation_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de validación DIAN'
  },
  payment_form: {
    type: DataTypes.ENUM('contado', 'credito', 'mixto'),
    defaultValue: 'contado',
    comment: 'Forma de pago'
  },
  payment_method: {
    type: DataTypes.ENUM('efectivo', 'transferencia', 'cheque', 'tarjeta', 'otro'),
    defaultValue: 'efectivo',
    comment: 'Método de pago'
  },
  payment_due_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de vencimiento (para crédito)'
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'COP',
    comment: 'Código de moneda ISO'
  },
  exchange_rate: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 1,
    comment: 'Tasa de cambio'
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'pagada', 'anulada'),
    defaultValue: 'pendiente',
    comment: 'Estado de la factura'
  },
  subtotal: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Subtotal antes de impuestos'
  },
  discount_percent: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: 'Porcentaje de descuento general'
  },
  discount_amount: {
    type: DataTypes.DECIMAL(18, 2),
    defaultValue: 0,
    comment: 'Monto de descuento'
  },
  base_iva: {
    type: DataTypes.DECIMAL(18, 2),
    defaultValue: 0,
    comment: 'Basegravable IVA'
  },
  iva_amount: {
    type: DataTypes.DECIMAL(18, 2),
    defaultValue: 0,
    comment: 'Monto total del IVA'
  },
  iva_percent: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 19,
    comment: 'Porcentaje de IVA estándar'
  },
  retention_amount: {
    type: DataTypes.DECIMAL(18, 2),
    defaultValue: 0,
    comment: 'Monto de retención en fuente'
  },
  total: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total a pagar'
  },
  total_letters: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Total escrito en letras'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas u observaciones'
  },
  terms: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Términos y condiciones'
  },
  qr_data: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Datos del código QR'
  },
  xml_data: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'XML de la factura electrónica'
  },
  pdf_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL del PDF generado'
  },
  printed_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Cantidad de veces impresa'
  },
  last_printed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'invoices',
  comment: 'Facturas electrónicas'
});

module.exports = Invoice;