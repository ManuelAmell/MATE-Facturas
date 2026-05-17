-- ============================================
-- SISTEMA DE FACTURACIÓN ELECTRÓNICA MATE
-- Base de Datos MySQL
-- ============================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS mate_facturas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mate_facturas;

-- ============================================
-- TABLA: companies (Empresas/Emisores)
-- ============================================

CREATE TABLE IF NOT EXISTS companies (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL COMMENT 'Razón social',
    nit VARCHAR(20) NOT NULL UNIQUE COMMENT 'Número de identificación tributario',
    email VARCHAR(100) NOT NULL COMMENT 'Correo electrónico',
    phone VARCHAR(20) DEFAULT NULL,
    address VARCHAR(300) DEFAULT NULL,
    department VARCHAR(100) DEFAULT NULL,
    municipality VARCHAR(100) DEFAULT NULL,
    country VARCHAR(50) DEFAULT 'Colombia',
    tax_responsibility VARCHAR(100) DEFAULT NULL COMMENT 'Responsabilidad tributaria',
    regimen VARCHAR(50) DEFAULT 'Común' COMMENT 'Régimen tributario',
    resolution_number VARCHAR(50) DEFAULT NULL COMMENT 'Número resolución DIAN',
    resolution_date DATE DEFAULT NULL COMMENT 'Fecha de resolución',
    resolution_prefix VARCHAR(10) DEFAULT NULL COMMENT 'Prefijo facturación',
    resolution_from INT DEFAULT NULL COMMENT 'Número inicial',
    resolution_to INT DEFAULT NULL COMMENT 'Número final',
    software_id VARCHAR(100) DEFAULT NULL COMMENT 'ID software DIAN',
    technical_pin VARCHAR(50) DEFAULT NULL COMMENT 'PIN técnico',
    logo_url VARCHAR(500) DEFAULT NULL,
    iva_percent DECIMAL(5,2) DEFAULT 19 COMMENT 'Porcentaje IVA',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nit (nit),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB COMMENT='Empresas emisoras de facturas';

-- ============================================
-- TABLA: customers (Clientes)
-- ============================================

CREATE TABLE IF NOT EXISTS customers (
    id CHAR(36) PRIMARY KEY,
    company_id CHAR(36) NOT NULL COMMENT 'Empresa matriz',
    name VARCHAR(200) NOT NULL COMMENT 'Razón social del cliente',
    commercial_name VARCHAR(200) DEFAULT NULL COMMENT 'Nombre comercial',
    identification_type ENUM('NIT', 'CC', 'CE', 'RC', 'NIT_RL') DEFAULT 'NIT' COMMENT 'Tipo de identificación',
    identification VARCHAR(20) NOT NULL COMMENT 'Número de identificación',
    email VARCHAR(100) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    address VARCHAR(300) DEFAULT NULL,
    department VARCHAR(100) DEFAULT NULL,
    municipality VARCHAR(100) DEFAULT NULL,
    country VARCHAR(50) DEFAULT 'Colombia',
    tax_responsibility VARCHAR(100) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company (company_id),
    INDEX idx_identification (identification),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB COMMENT='Clientes/Compradores';

-- ============================================
-- TABLA: invoices (Facturas)
-- ============================================

CREATE TABLE IF NOT EXISTS invoices (
    id CHAR(36) PRIMARY KEY,
    company_id CHAR(36) NOT NULL COMMENT 'Empresa emitente',
    customer_id CHAR(36) NOT NULL COMMENT 'Cliente',
    invoice_number VARCHAR(20) NOT NULL COMMENT 'Número de factura',
    uuid VARCHAR(36) NOT NULL UNIQUE COMMENT 'UUID único',
    cufe VARCHAR(100) DEFAULT NULL COMMENT 'Código único DIAN',
    prefix VARCHAR(10) DEFAULT NULL COMMENT 'Prefijo FE',
    issue_date DATE NOT NULL COMMENT 'Fecha de emisión',
    issue_time TIME DEFAULT NULL COMMENT 'Hora de emisión',
    validation_date DATETIME DEFAULT NULL COMMENT 'Fecha validación DIAN',
    payment_form ENUM('contado', 'credito', 'mixto') DEFAULT 'contado',
    payment_method ENUM('efectivo', 'transferencia', 'cheque', 'tarjeta', 'otro') DEFAULT 'efectivo',
    payment_due_date DATE DEFAULT NULL COMMENT 'Vencimiento crédito',
    currency VARCHAR(3) DEFAULT 'COP',
    exchange_rate DECIMAL(10,4) DEFAULT 1,
    status ENUM('pendiente', 'pagada', 'anulada') DEFAULT 'pendiente',
    subtotal DECIMAL(18,2) NOT NULL DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(18,2) DEFAULT 0,
    base_iva DECIMAL(18,2) DEFAULT 0,
    iva_amount DECIMAL(18,2) DEFAULT 0,
    iva_percent DECIMAL(5,2) DEFAULT 19,
    retention_amount DECIMAL(18,2) DEFAULT 0,
    total DECIMAL(18,2) NOT NULL DEFAULT 0,
    total_letters VARCHAR(500) DEFAULT NULL,
    notes TEXT,
    terms VARCHAR(500) DEFAULT NULL,
    qr_data TEXT,
    xml_data TEXT,
    pdf_url VARCHAR(500) DEFAULT NULL,
    printed_count INT DEFAULT 0,
    last_printed_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    INDEX idx_company (company_id),
    INDEX idx_customer (customer_id),
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_uuid (uuid),
    INDEX idx_status (status),
    INDEX idx_issue_date (issue_date),
    UNIQUE KEY uk_invoice_company (company_id, invoice_number)
) ENGINE=InnoDB COMMENT='Facturas electrónicas';

-- ============================================
-- TABLA: invoice_items (Líneas de factura)
-- ============================================

CREATE TABLE IF NOT EXISTS invoice_items (
    id CHAR(36) PRIMARY KEY,
    invoice_id CHAR(36) NOT NULL,
    line_number INT NOT NULL COMMENT 'Número de línea',
    code VARCHAR(50) DEFAULT NULL COMMENT 'Código producto',
    description VARCHAR(500) NOT NULL COMMENT 'Descripción',
    quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
    unit VARCHAR(10) DEFAULT 'UND' COMMENT 'Unidad medida',
    unit_price DECIMAL(18,4) NOT NULL COMMENT 'Precio unitario',
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(18,2) DEFAULT 0,
    iva_rate DECIMAL(5,2) DEFAULT 19 COMMENT 'Tasa IVA',
    iva_amount DECIMAL(18,2) DEFAULT 0,
    base_iva DECIMAL(18,2) DEFAULT 0,
    subtotal DECIMAL(18,2) NOT NULL COMMENT 'Subtotal línea',
    total DECIMAL(18,2) NOT NULL COMMENT 'Total línea',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    INDEX idx_invoice (invoice_id),
    INDEX idx_line_number (line_number)
) ENGINE=InnoDB COMMENT='Items/detalles de facturas';

-- ============================================
-- DATOS DE EJEMPLO - COMPANY
-- ============================================

INSERT INTO companies (
    id,
    name,
    nit,
    email,
    phone,
    address,
    department,
    municipality,
    country,
    tax_responsibility,
    regimen,
    resolution_number,
    resolution_date,
    resolution_prefix,
    resolution_from,
    resolution_to,
    software_id,
    technical_pin,
    iva_percent
) VALUES (
    'company-001',
    'MATE HIELO Y AGUA PURIFICADA S.A.S.',
    '901.234.567-1',
    'contacto@matehielo.com',
    '+57 300 123 4567',
    'Carrera 45 # 32-18, Bodega 12',
    'Antioquia',
    'Medellín',
    'Colombia',
    'Responsable de IVA',
    'Común',
    '18760000001',
    '2024-01-15',
    'FE',
    1,
    100000,
    '51a23b3c-4d5e-6f7g-8h9i-0j1k2l3m4n5o',
    '123456789ABCDEF',
    19
);

-- ============================================
-- DATOS DE EJEMPLO - CUSTOMER
-- ============================================

INSERT INTO customers (
    id,
    company_id,
    name,
    commercial_name,
    identification_type,
    identification,
    email,
    phone,
    address,
    department,
    municipality,
    country,
    tax_responsibility
) VALUES (
    'customer-001',
    'company-001',
    'COMERCIALIZADORA EL SOL S.A.S.',
    'El Sol Supermercados',
    'NIT',
    '900.123.456-7',
    'compras@elsol.com',
    '+57 301 987 6543',
    'Calle 50 # 45-67',
    'Antioquia',
    'Medellín',
    'Colombia',
    'Responsable de IVA'
);

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT '✓ Base de datos creada correctamente' AS status;
SELECT COUNT(*) AS total_companies FROM companies;
SELECT COUNT(*) AS total_customers FROM customers;