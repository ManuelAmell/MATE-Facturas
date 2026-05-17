const { Company } = require('../models');

async function getCompany(req, res) {
  try {
    const company = await Company.findOne({ where: { is_active: true } });
    if (!company) {
      return res.status(404).json({ success: false, message: 'No hay empresa configurada' });
    }
    res.json({ success: true, data: company });
  } catch (error) {
    console.error('Error getCompany:', error);
    res.status(500).json({ success: false, message: 'Error al obtener empresa', error: error.message });
  }
}

async function updateCompany(req, res) {
  try {
    const { id } = req.params;
    const {
      name, nit, email, phone, address, municipality, department,
      country, tax_responsibility, regimen, logo_url
    } = req.body;

    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Empresa no encontrada' });
    }

    await company.update({
      name: name !== undefined ? name : company.name,
      nit: nit !== undefined ? nit : company.nit,
      email: email !== undefined ? email : company.email,
      phone: phone !== undefined ? phone : company.phone,
      address: address !== undefined ? address : company.address,
      municipality: municipality !== undefined ? municipality : company.municipality,
      department: department !== undefined ? department : company.department,
      country: country !== undefined ? country : company.country,
      tax_responsibility: tax_responsibility !== undefined ? tax_responsibility : company.tax_responsibility,
      regimen: regimen !== undefined ? regimen : company.regimen,
      logo_url: logo_url !== undefined ? logo_url : company.logo_url
    });

    res.json({ success: true, data: company });
  } catch (error) {
    console.error('Error updateCompany:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar empresa', error: error.message });
  }
}

module.exports = { getCompany, updateCompany };
