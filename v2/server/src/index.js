require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const invoiceRoutes = require('./routes/invoices');
const productRoutes = require('./routes/products');
const companyRoutes = require('./routes/company');
const customerRoutes = require('./routes/customers');
const { sequelize } = require('./models');
const { ensureDatabaseExists } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARES
// ============================================

// Seguridad - Headers HTTP seguros
app.use(helmet());

// CORS - Permitir solicitudes desde el frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate Limiting - Proteger contra ataques de fuerza bruta
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas solicitudes, intente de nuevo más tarde' }
});
app.use('/api/', limiter);

// Body parser - Parsear JSON
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============================================
// RUTAS API
// ============================================

app.use('/api/invoices', invoiceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/customers', customerRoutes);

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: sequelize ? 'connected' : 'disconnected'
  });
});

// Endpoint para datos de ejemplo/mock
app.get('/api/mock/data', (req, res) => {
  res.json({
    company: {
      id: 'company-001',
      name: 'MATE HIELO Y AGUA PURIFICADA S.A.S.',
      nit: '901.234.567-1',
      email: 'contacto@matehielo.com',
      phone: '(+57) 300 123 4567',
      address: 'Carrera 45 # 32-18, Bodega 12',
      department: 'Antioquia',
      municipality: 'Medellín',
      country: 'Colombia',
      tax_responsibility: 'Responsable de IVA',
      regimen: 'Común',
      resolution_number: '18760000001',
      resolution_date: '2024-01-15',
      resolution_prefix: 'FE',
      resolution_from: 1,
      resolution_to: 100000,
      software_id: '51a23b3c-4d5e-6f7g-8h9i-0j1k2l3m4n5o',
      technical_pin: '123456789ABCDEF',
      logo_url: '/logo.jpeg'
    },
    customer: {
      id: 'customer-001',
      name: 'COMERCIALIZADORA EL SOL S.A.S.',
      commercial_name: 'El Sol Supermercados',
      identification_type: 'NIT',
      identification: '900.123.456-7',
      email: 'compras@elsol.com',
      phone: '(+57) 301 987 6543',
      address: 'Calle 50 # 45-67',
      department: 'Antioquia',
      municipality: 'Medellín',
      country: 'Colombia',
      tax_responsibility: 'Responsable de IVA'
    },
    items: [
      {
        code: 'HIELO-001',
        description: 'Hielo en cubos - Bolsa 5kg',
        quantity: 50,
        unit: 'BLS',
        unit_price: 8000,
        iva_rate: 19
      },
      {
        code: 'AGUA-001',
        description: 'Agua purificada - Garrafón 20L',
        quantity: 30,
        unit: 'GLF',
        unit_price: 12000,
        iva_rate: 19
      },
      {
        code: 'HIELO-BOLSA',
        description: 'Hielo en bolsa - 1kg',
        quantity: 100,
        unit: 'UND',
        unit_price: 2000,
        iva_rate: 19
      }
    ],
    invoice: {
      payment_form: 'contado',
      payment_method: 'transferencia',
      currency: 'COP',
      notes: 'Gracias por su compra',
      terms: 'Pagadero dentro de 30 días'
    }
  });
});

// ============================================
// INICIALIZACIÓN
// ============================================

async function startServer() {
  try {
    // Crear base de datos si no existe
    await ensureDatabaseExists();

    // Probar conexión a la base de datos
    if (process.env.NODE_ENV !== 'test') {
      await sequelize.authenticate();
      console.log('✓ Conexión a MySQL establecida');
    }

    // Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development' && process.env.SYNC_DB === 'true') {
      await sequelize.sync({ alter: true });
      console.log('✓ Modelos sincronizados con la base de datos');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║   SERVIDOR DE FACTURACIÓN ELECTRÓNICA             ║
║   Puerto: ${PORT}                                    ║
║   Modo: ${process.env.NODE_ENV || 'development'}                          ║
╚═══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('✗ Error al iniciar el servidor:', error);
    // Iniciar sin base de datos (modo demo)
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║   SERVIDOR DE FACTURACIÓN ELECTRÓNICA (DEMO)     ║
║   Puerto: ${PORT}                                    ║
║   Base de datos: No conectada                      ║
╚═══════════════════════════════════════════════════╝
      `);
    });
  }
}

startServer();

module.exports = app;