const { sequelize } = require('../config/database');
const Company = require('./Company');
const Customer = require('./Customer');
const Invoice = require('./Invoice');
const InvoiceItem = require('./InvoiceItem');
const Product = require('./Product');

// ============================================
// RELACIONES O RELACIONES DE LOS MODELOS
// ============================================

// Company - Customer: Una empresa puede tener muchos clientes
Company.hasMany(Customer, {
  foreignKey: 'company_id',
  as: 'customers'
});
Customer.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'company'
});

// Company - Invoice: Una empresa puede tener muchas facturas
Company.hasMany(Invoice, {
  foreignKey: 'company_id',
  as: 'invoices'
});
Invoice.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'company'
});

// Customer - Invoice: Un cliente puede tener muchas facturas
Customer.hasMany(Invoice, {
  foreignKey: 'customer_id',
  as: 'invoices'
});
Invoice.belongsTo(Customer, {
  foreignKey: 'customer_id',
  as: 'customer'
});

// Invoice - InvoiceItem: Una factura tiene muchos items
Invoice.hasMany(InvoiceItem, {
  foreignKey: 'invoice_id',
  as: 'items'
});
InvoiceItem.belongsTo(Invoice, {
  foreignKey: 'invoice_id',
  as: 'invoice'
});

// Company - Product: Una empresa tiene muchos productos
Company.hasMany(Product, {
  foreignKey: 'company_id',
  as: 'products'
});
Product.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'company'
});

module.exports = {
  sequelize,
  Company,
  Customer,
  Invoice,
  InvoiceItem,
  Product
};