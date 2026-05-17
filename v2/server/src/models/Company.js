const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Razón social de la empresa'
  },
  nit: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Número de identificación tributario'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
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
    comment: 'Responsabilidad tributaria (ej: Responsable de IVA)'
  },
  regimen: {
    type: DataTypes.STRING(50),
    defaultValue: 'Común',
    comment: 'Régimen (Común o Simplificado)'
  },
  resolution_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Número de resolución DIAN'
  },
  resolution_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de resolución DIAN'
  },
  resolution_prefix: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Prefijo de facturación (ej: FE)'
  },
  resolution_from: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Número inicial de resolución'
  },
  resolution_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Número final de resolución'
  },
  software_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'ID del software asignado por DIAN'
  },
  technical_pin: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'PIN técnico del software'
  },
  logo_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'companies',
  comment: 'Empresas/Emisores de facturas electrónicas'
});

module.exports = Company;