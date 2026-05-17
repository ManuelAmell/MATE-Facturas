const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('Customer', {
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
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Nombre o razón social del cliente'
  },
  commercial_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Nombre comercial del cliente'
  },
  identification_type: {
    type: DataTypes.ENUM('NIT', 'CC', 'CE', 'RC', 'NIT_RL'),
    defaultValue: 'NIT',
    comment: 'Tipo de identificación'
  },
  identification: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Número de identificación'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  address: {
    type: DataTypes.STRING(300),
    allowNull: true
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  municipality: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(50),
    defaultValue: 'Colombia'
  },
  tax_responsibility: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Responsabilidad tributaria del cliente'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'customers',
  comment: 'Clientes/Compradores de facturas'
});

module.exports = Customer;