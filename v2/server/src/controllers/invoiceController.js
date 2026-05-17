const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { Invoice, InvoiceItem, Company, Customer, sequelize } = require('../models');
const invoiceService = require('../services/invoiceService');
const pdfService = require('../services/pdfService');

/**
 * Obtiene todas las facturas con paginación
 */
async function getInvoices(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      company_id,
      customer_id,
      start_date,
      end_date,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (status) whereClause.status = status;
    if (company_id) whereClause.company_id = company_id;
    if (customer_id) whereClause.customer_id = customer_id;
    if (start_date && end_date) {
      whereClause.issue_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const buildSearchWhere = () => {
      const conditions = [];
      if (search) {
        conditions.push({ invoice_number: { [Op.like]: `%${search}%` } });
      }
      return conditions.length > 0 ? { [Op.or]: conditions } : {};
    };

    const { count, rows } = await Invoice.findAndCountAll({
      where: {
        ...whereClause,
        ...buildSearchWhere()
      },
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name', 'nit', 'email'] },
        {
          model: Customer, as: 'customer',
          attributes: ['id', 'name', 'identification', 'email'],
          where: search ? {
            [Op.or]: [
              { name: { [Op.like]: `%${search}%` } },
              { identification: { [Op.like]: `%${search}%` } }
            ]
          } : undefined,
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
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
    console.error('Error getInvoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las facturas',
      error: error.message
    });
  }
}

/**
 * Obtiene una factura por ID con todos sus detalles
 */
async function getInvoiceById(req, res) {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findOne({
      where: { id },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'nit', 'email', 'phone', 'address',
            'department', 'municipality', 'country', 'tax_responsibility',
            'regimen', 'resolution_number', 'software_id', 'technical_pin', 'logo_url']
        },
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'commercial_name', 'identification_type',
            'identification', 'email', 'phone', 'address', 'department',
            'municipality', 'country', 'tax_responsibility']
        },
        { model: InvoiceItem, as: 'items', order: [['line_number', 'ASC']] }
      ]
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error getInvoiceById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la factura',
      error: error.message
    });
  }
}

/**
 * Crea una nueva factura
 */
async function createInvoice(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const {
      company_id,
      customer_id,
      customer: customerData,
      issue_date,
      payment_form,
      payment_method,
      payment_due_date,
      currency,
      discount_percent,
      retention_percent,
      notes,
      terms,
      items
    } = req.body;

    // Validar que exista la empresa
    const company = await Company.findByPk(company_id);
    if (!company) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Empresa no encontrada'
      });
    }

    // Buscar o crear el cliente
    let customer;
    if (customer_id) {
      customer = await Customer.findByPk(customer_id);
      if (!customer) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }
    } else if (customerData && customerData.name && customerData.identification) {
      customer = await Customer.findOne({
        where: { identification: customerData.identification, company_id }
      });
      if (customer) {
        await customer.update({
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          municipality: customerData.municipality,
          department: customerData.department
        });
      } else {
        customer = await Customer.create({
          company_id,
          name: customerData.name,
          identification: customerData.identification,
          identification_type: customerData.identification_type || 'NIT',
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          municipality: customerData.municipality,
          department: customerData.department,
          country: 'Colombia',
          tax_responsibility: customerData.tax_responsibility || 'Responsable de IVA'
        }, { transaction });
      }
    } else {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Se requiere customer_id o datos del cliente (name + identification)'
      });
    }

    // Obtener el último número de factura
    const lastInvoice = await Invoice.findOne({
      where: { company_id },
      order: [['invoice_number', 'DESC']]
    });

    // Generar número de factura
    const lastNumber = lastInvoice
      ? parseInt(lastInvoice.invoice_number.replace(/\D/g, ''))
      : (company.resolution_from || 1);
    const invoiceNumber = invoiceService.generateInvoiceNumber(company, lastNumber);

    // Generar UUID único
    const uuid = uuidv4();

    // Calcular totales
    const calculated = invoiceService.calculateInvoiceTotals(items, {
      discount_percent: discount_percent ?? 0,
      iva_rate: company.iva_percent ?? 19,
      retention_percent: retention_percent ?? 0
    });

    // Generar CUFE
    const cufe = invoiceService.generateCUFE({
      invoice_number: invoiceNumber,
      issue_date,
      issue_time: new Date().toTimeString().split(' ')[0],
      total: calculated.total,
      iva_amount: calculated.iva_amount,
      base_iva: calculated.base_iva,
      tax_identification: company.nit,
      pin_technical: company.technical_pin,
      prefix: company.resolution_prefix || 'FE'
    });

    // Generar QR
    const qrData = await invoiceService.generateQR({
      uuid,
      cufe,
      invoice_number: invoiceNumber,
      company_name: company.name,
      identification: company.nit,
      total: calculated.total,
      iva_amount: calculated.iva_amount,
      issue_date
    });

    // Crear la factura
    const invoice = await Invoice.create({
      company_id,
      customer_id,
      invoice_number: invoiceNumber,
      uuid,
      cufe,
      prefix: company.resolution_prefix || 'FE',
      issue_date,
      issue_time: new Date().toTimeString().split(' ')[0],
      validation_date: new Date(),
      payment_form: payment_form || 'contado',
      payment_method: payment_method || 'efectivo',
      payment_due_date,
      currency: currency || 'COP',
      status: 'pendiente',
      subtotal: calculated.subtotal,
      discount_percent,
      discount_amount: calculated.total_discount,
      base_iva: calculated.base_iva,
      iva_amount: calculated.iva_amount,
      iva_percent: calculated.iva_rate,
      retention_amount: calculated.retention_amount,
      total: calculated.total,
      total_letters: calculated.total_letters,
      notes,
      terms,
      qr_data: qrData
    }, { transaction });

    // Crear los items de la factura
    const invoiceItems = items.map((item, index) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unit_price = parseFloat(item.unit_price) || 0;
      const discount_percent = parseFloat(item.discount_percent) || 0;
      const iva_rate = !isNaN(parseFloat(item.iva_rate)) ? parseFloat(item.iva_rate) : 19;

      const line_subtotal = quantity * unit_price;
      const line_discount = line_subtotal * (discount_percent / 100);
      const line_base_iva = line_subtotal - line_discount;
      const line_iva = line_base_iva * (iva_rate / 100);
      const line_total = line_base_iva + line_iva;

      return {
        invoice_id: invoice.id,
        line_number: index + 1,
        code: item.code || '',
        description: item.description,
        quantity,
        unit: item.unit || 'UND',
        unit_price,
        discount_percent,
        discount_amount: line_discount,
        iva_rate,
        iva_amount: line_iva,
        base_iva: line_base_iva,
        subtotal: line_subtotal,
        total: line_total
      };
    });

    await InvoiceItem.bulkCreate(invoiceItems, { transaction });

    await transaction.commit();

    // Obtener la factura creada con sus relaciones
    const createdInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        { model: Company, as: 'company' },
        { model: Customer, as: 'customer' },
        { model: InvoiceItem, as: 'items' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Factura creada exitosamente',
      data: createdInvoice
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error createInvoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la factura',
      error: error.message
    });
  }
}

/**
 * Actualiza una factura
 */
async function updateInvoice(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      customer_id,
      issue_date,
      payment_form,
      payment_method,
      payment_due_date,
      currency,
      discount_percent,
      retention_percent,
      status,
      notes,
      terms,
      items
    } = req.body;

    const invoice = await Invoice.findByPk(id);

    if (!invoice) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    // Si la factura ya está pagada o anulada, no permitir edición
    if (invoice.status !== 'pendiente') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No se puede editar una factura que ya está pagada o anulada'
      });
    }

    // Obtener datos de la empresa
    const company = await Company.findByPk(invoice.company_id);
    const customer = await Customer.findByPk(customer_id || invoice.customer_id);

    // Recalcular si hay items
    let calculated = {};
    if (items && items.length > 0) {
      calculated = invoiceService.calculateInvoiceTotals(items, {
        discount_percent: discount_percent ?? invoice.discount_percent ?? 0,
        iva_rate: company.iva_percent ?? 19,
        retention_percent: retention_percent ?? 0
      });
    } else {
      calculated = {
        subtotal: invoice.subtotal,
        discount_amount: invoice.discount_amount,
        base_iva: invoice.base_iva,
        iva_amount: invoice.iva_amount,
        iva_percent: invoice.iva_percent,
        retention_amount: invoice.retention_amount,
        total: invoice.total,
        total_letters: invoice.total_letters
      };
    }

    // Actualizar la factura
    await invoice.update({
      customer_id: customer_id || invoice.customer_id,
      issue_date: issue_date || invoice.issue_date,
      payment_form: payment_form || invoice.payment_form,
      payment_method: payment_method || invoice.payment_method,
      payment_due_date: payment_due_date || invoice.payment_due_date,
      currency: currency || invoice.currency,
      discount_percent: discount_percent || invoice.discount_percent,
      retention_amount: calculated.retention_amount || invoice.retention_amount,
      subtotal: calculated.subtotal,
      discount_amount: calculated.discount_amount,
      base_iva: calculated.base_iva,
      iva_amount: calculated.iva_amount,
      iva_percent: calculated.iva_percent,
      total: calculated.total,
      total_letters: calculated.total_letters,
      status: status || invoice.status,
      notes: notes !== undefined ? notes : invoice.notes,
      terms: terms !== undefined ? terms : invoice.terms
    }, { transaction });

    // Actualizar items si se proporcionan
    if (items && items.length > 0) {
      // Eliminar items existentes
      await InvoiceItem.destroy({ where: { invoice_id: id }, transaction });

      // Crear nuevos items
      const invoiceItems = items.map((item, index) => {
        const quantity = parseFloat(item.quantity) || 0;
        const unit_price = parseFloat(item.unit_price) || 0;
        const discount_percent = parseFloat(item.discount_percent) || 0;
        const iva_rate = !isNaN(parseFloat(item.iva_rate)) ? parseFloat(item.iva_rate) : 19;

        const line_subtotal = quantity * unit_price;
        const line_discount = line_subtotal * (discount_percent / 100);
        const line_base_iva = line_subtotal - line_discount;
        const line_iva = line_base_iva * (iva_rate / 100);
        const line_total = line_base_iva + line_iva;

        return {
          invoice_id: id,
          line_number: index + 1,
          code: item.code || '',
          description: item.description,
          quantity,
          unit: item.unit || 'UND',
          unit_price,
          discount_percent,
          discount_amount: line_discount,
          iva_rate,
          iva_amount: line_iva,
          base_iva: line_base_iva,
          subtotal: line_subtotal,
          total: line_total
        };
      });

      await InvoiceItem.bulkCreate(invoiceItems, { transaction });
    }

    await transaction.commit();

    const updatedInvoice = await Invoice.findByPk(id, {
      include: [
        { model: Company, as: 'company' },
        { model: Customer, as: 'customer' },
        { model: InvoiceItem, as: 'items' }
      ]
    });

    res.json({
      success: true,
      message: 'Factura actualizada exitosamente',
      data: updatedInvoice
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updateInvoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la factura',
      error: error.message
    });
  }
}

/**
 * Cambia el estado de una factura (anular)
 */
async function updateInvoiceStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const invoice = await Invoice.findByPk(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    // Solo permitir cambiar a anulada
    if (status !== 'anulada' && status !== 'pagada' && status !== 'pendiente') {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }

    await invoice.update({
      status,
      notes: status === 'anulada'
        ? `ANULADA - Razón: ${reason || 'No especificada'}. ${invoice.notes || ''}`
        : invoice.notes
    });

    const updatedInvoice = await Invoice.findByPk(id, {
      include: [
        { model: Company, as: 'company' },
        { model: Customer, as: 'customer' },
        { model: InvoiceItem, as: 'items' }
      ]
    });

    res.json({
      success: true,
      message: `Factura marcada como ${status}`,
      data: updatedInvoice
    });
  } catch (error) {
    console.error('Error updateInvoiceStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el estado de la factura',
      error: error.message
    });
  }
}

/**
 * Elimina (anula) una factura
 */
async function deleteInvoice(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const invoice = await Invoice.findByPk(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    // No eliminar, solo anular
    await invoice.update({
      status: 'anulada',
      notes: `ANULADA - Razón: ${reason || 'Eliminado por usuario'}. ${invoice.notes || ''}`
    });

    res.json({
      success: true,
      message: 'Factura anulada correctamente'
    });
  } catch (error) {
    console.error('Error deleteInvoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la factura',
      error: error.message
    });
  }
}

/**
 * Genera un PDF de la factura
 */
async function generatePDF(req, res) {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findOne({
      where: { id },
      include: [
        { model: Company, as: 'company' },
        { model: Customer, as: 'customer' },
        { model: InvoiceItem, as: 'items' }
      ]
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    // Incrementar contador de impresiones
    await invoice.update({
      printed_count: invoice.printed_count + 1,
      last_printed_at: new Date()
    });

    // Generar PDF usando el servicio
    const pdfBuffer = await pdfService.generatePDFBuffer(invoice);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=factura-${invoice.invoice_number}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generatePDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el PDF',
      error: error.message
    });
  }
}

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  generatePDF
};