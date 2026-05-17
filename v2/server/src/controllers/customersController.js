const { Customer } = require('../models');
const { Op } = require('sequelize');

async function getCustomers(req, res) {
  try {
    const { search, company_id, limit = 20 } = req.query;
    const whereClause = { is_active: true };

    if (company_id) whereClause.company_id = company_id;
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { identification: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const customers = await Customer.findAll({
      where: whereClause,
      order: [['name', 'ASC']],
      limit: parseInt(limit)
    });

    res.json({ success: true, data: customers });
  } catch (error) {
    console.error('Error getCustomers:', error);
    res.status(500).json({ success: false, message: 'Error al obtener clientes', error: error.message });
  }
}

async function createCustomer(req, res) {
  try {
    const {
      company_id, name, identification_type, identification,
      email, phone, address, municipality, department, tax_responsibility
    } = req.body;

    if (!company_id || !name || !identification) {
      return res.status(400).json({
        success: false,
        message: 'company_id, name e identification son requeridos'
      });
    }

    const customer = await Customer.create({
      company_id,
      name,
      identification_type: identification_type || 'NIT',
      identification,
      email,
      phone,
      address,
      municipality: municipality || department,
      department: department || municipality,
      country: 'Colombia',
      tax_responsibility: tax_responsibility || 'Responsable de IVA'
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    console.error('Error createCustomer:', error);
    res.status(500).json({ success: false, message: 'Error al crear cliente', error: error.message });
  }
}

async function findOrCreateCustomer(req, res) {
  try {
    const { company_id, name, identification, ...rest } = req.body;

    if (!company_id || !name || !identification) {
      return res.status(400).json({
        success: false,
        message: 'company_id, name e identification son requeridos'
      });
    }

    let customer = await Customer.findOne({
      where: { identification, company_id }
    });

    if (customer) {
      await customer.update({
        name, email: rest.email, phone: rest.phone,
        address: rest.address, municipality: rest.municipality,
        department: rest.department
      });
    } else {
      customer = await Customer.create({
        company_id, name, identification,
        identification_type: rest.identification_type || 'NIT',
        email: rest.email, phone: rest.phone,
        address: rest.address, municipality: rest.municipality,
        department: rest.department,
        country: 'Colombia',
        tax_responsibility: rest.tax_responsibility || 'Responsable de IVA'
      });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error findOrCreateCustomer:', error);
    res.status(500).json({ success: false, message: 'Error al buscar/crear cliente', error: error.message });
  }
}

async function getCustomersList(req, res) {
  try {
    const { company_id } = req.query;
    const whereClause = { is_active: true };

    if (company_id) whereClause.company_id = company_id;

    const customers = await Customer.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'identification'],
      order: [['name', 'ASC']]
    });

    res.json({ success: true, data: customers });
  } catch (error) {
    console.error('Error getCustomersList:', error);
    res.status(500).json({ success: false, message: 'Error al obtener lista de clientes', error: error.message });
  }
}

module.exports = { getCustomers, createCustomer, findOrCreateCustomer, getCustomersList };
