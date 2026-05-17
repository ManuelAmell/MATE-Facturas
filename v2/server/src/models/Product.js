const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
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
  code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Código del producto (opcional)'
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Descripción del producto (opcional)'
  },
  unit_price: {
    type: DataTypes.DECIMAL(18, 4),
    allowNull: false,
    comment: 'Precio unitario sin impuestos (obligatorio)'
  },
  unit: {
    type: DataTypes.STRING(10),
    defaultValue: 'UND',
    comment: 'Unidad de medida'
  },
  iva_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 19,
    comment: 'Porcentaje de IVA'
  },
  cost: {
    type: DataTypes.DECIMAL(18, 4),
    allowNull: true,
    comment: 'Costo del producto (opcional, para control de ganancia)'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'products',
  comment: 'Productos/Servicios del catálogo'
});

module.exports = Product;
