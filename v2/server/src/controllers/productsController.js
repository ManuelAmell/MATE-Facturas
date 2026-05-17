const { Product, Company } = require('../models');
const { Op } = require('sequelize');

async function getProducts(req, res) {
  try {
    const { company_id, search, page = 1, limit = 50 } = req.query;
    const whereClause = { is_active: true };

    if (company_id) whereClause.company_id = company_id;
    if (search) {
      whereClause[Op.or] = [
        { code: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      include: [{ model: Company, as: 'company', attributes: ['id', 'name', 'nit'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error getProducts:', error);
    res.status(500).json({ success: false, message: 'Error al obtener productos', error: error.message });
  }
}

async function createProduct(req, res) {
  try {
    const { company_id, code, description, unit_price, unit, iva_rate, cost } = req.body;

    if (!company_id) {
      return res.status(400).json({ success: false, message: 'company_id es requerido' });
    }

    const company = await Company.findByPk(company_id);
    if (!company) {
      return res.status(400).json({ success: false, message: 'Empresa no encontrada' });
    }

    const product = await Product.create({
      company_id,
      code,
      description,
      unit_price,
      unit: unit || 'UND',
      iva_rate: iva_rate || 19,
      cost
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('Error createProduct:', error);
    res.status(500).json({ success: false, message: 'Error al crear producto', error: error.message });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { code, description, unit_price, unit, iva_rate, cost, is_active } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    await product.update({
      code: code !== undefined ? code : product.code,
      description: description !== undefined ? description : product.description,
      unit_price: unit_price !== undefined ? unit_price : product.unit_price,
      unit: unit !== undefined ? unit : product.unit,
      iva_rate: iva_rate !== undefined ? iva_rate : product.iva_rate,
      cost: cost !== undefined ? cost : product.cost,
      is_active: is_active !== undefined ? is_active : product.is_active
    });

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error updateProduct:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar producto', error: error.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    await product.update({ is_active: false });

    res.json({ success: true, message: 'Producto desactivado correctamente' });
  } catch (error) {
    console.error('Error deleteProduct:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar producto', error: error.message });
  }
}

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
