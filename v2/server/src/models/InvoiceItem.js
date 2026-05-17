const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InvoiceItem = sequelize.define('InvoiceItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoice_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'invoices',
      key: 'id'
    }
  },
  line_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Número de línea'
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Código del producto/servicio'
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Descripción del producto o servicio'
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    defaultValue: 1,
    comment: 'Cantidad'
  },
  unit: {
    type: DataTypes.STRING(10),
    defaultValue: 'UND',
    comment: 'Unidad de medida (UND, KG, LB, etc)'
  },
  unit_price: {
    type: DataTypes.DECIMAL(18, 4),
    allowNull: false,
    comment: 'Precio unitario sin impuestos'
  },
  discount_percent: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: 'Porcentaje de descuento de la línea'
  },
  discount_amount: {
    type: DataTypes.DECIMAL(18, 2),
    defaultValue: 0,
    comment: 'Monto de descuento de la línea'
  },
  iva_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 19,
    comment: 'Porcentaje de IVA (0, 5, 19)'
  },
  iva_amount: {
    type: DataTypes.DECIMAL(18, 2),
    defaultValue: 0,
    comment: 'Monto del IVA'
  },
  base_iva: {
    type: DataTypes.DECIMAL(18, 2),
    defaultValue: 0,
    comment: 'Base gravable del IVA'
  },
  subtotal: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    comment: 'Subtotal línea (cantidad x precio - descuento)'
  },
  total: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    comment: 'Total línea incluyendo impuestos'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'invoice_items',
  comment: 'Líneas de detalle de facturas'
});

module.exports = InvoiceItem;