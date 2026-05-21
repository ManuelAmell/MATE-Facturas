// Datos mock para permitir funcionamiento sin backend
export const mockCompany = {
  id: 1,
  name: "AGUAS SEBMAT",
  nit: "-----------",
  address: "-----------",
  phone: "----------",
  email: "----------",
  resolution_number: "----------",
  regimen: "Común"
};

export const mockCustomer = {
  name: "CLIENTE DE EJEMPLO",
  identification: "1234567890",
  email: "cliente@ejemplo.com",
  phone: "+57 300 123 4567",
  address: "Carrera 45 #67-89",
  municipality: "Bogotá",
  department: "Cundinamarca"
};

export const mockProducts = [
  {
    id: 1,
    code: "PROD001",
    description: "Bolsa de hielo",
    unit_price: 2000,
    iva_rate: 0,
    unit: "UND"
  },
  {
    id: 2,
    code: "PROD002",
    description: "Botellon de agua (20L)", 
    unit_price: 25000,
    iva_rate: 0,
    unit: "UND"
  }
];

// Función para obtener datos mock en lugar de llamar al backend
export const mockApiService = {
  // Company
  getCompany: () => Promise.resolve({ success: true, data: mockCompany }),
  updateCompany: (id, data) => Promise.resolve({ success: true, data: { ...mockCompany, ...data } }),
  
  // Products
  getProducts: (params = {}) => Promise.resolve({ success: true, data: mockProducts }),
  createProduct: (data) => Promise.resolve({ success: true, data: { ...data, id: Date.now() } }),
  updateProduct: (id, data) => Promise.resolve({ success: true, data: { id, ...data } }),
  deleteProduct: (id) => Promise.resolve({ success: true }),
  
  // Customers
  getCustomers: (params = {}) => Promise.resolve({ success: true, data: [mockCustomer] }),
  createCustomer: (data) => Promise.resolve({ success: true, data: { ...data, id: Date.now() } }),
  findOrCreateCustomer: (data) => Promise.resolve({ success: true, data: { ...data, id: Date.now() } }),
  getCustomersList: () => Promise.resolve({ success: true, data: [mockCustomer] }),
  
  // Invoices - Simulamos que podemos obtener facturas por ID
  getInvoices: (params = {}) => Promise.resolve({ success: true, data: [] }),
  getInvoiceById: (id) => {
    // Simulamos una factura de ejemplo basada en el ID
    const mockInvoice = {
      id,
      invoice_number: `FAC-000${id}`,
      issue_date: new Date().toISOString().split('T')[0],
      company: mockCompany,
      customer: mockCustomer,
      payment_form: 'contado',
      payment_method: 'efectivo',
      currency: 'COP',
      notes: 'Factura',
      terms: 'Pago inmediato',
      items: [
        {
          id: `item-${id}-1`,
          code: 'PROD001',
          description: 'Producto 1',
          quantity: 2,
          unit_price: 10000,
          unit: 'UND',
          iva_rate: 19,
          subtotal: 20000,
          iva_amount: 3800,
          total: 23800
        },
        {
          id: `item-${id}-2`,
          code: 'SERV001',
          description: 'Servicio de ejemplo',
          quantity: 1,
          unit_price: 50000,
          unit: 'UND',
          iva_rate: 0,
          subtotal: 50000,
          iva_amount: 0,
          total: 50000
        }
      ]
    };
    
    // Calcular totales
    const subtotal = mockInvoice.items.reduce((sum, item) => sum + item.subtotal, 0);
    const ivaAmount = mockInvoice.items.reduce((sum, item) => sum + item.iva_amount, 0);
    const total = subtotal + ivaAmount;
    
    return Promise.resolve({
      success: true,
      data: {
        ...mockInvoice,
        subtotal,
        base_iva: subtotal, // Asumimos que toda la base es gravable
        iva_amount: ivaAmount,
        discount_amount: 0,
        total,
        total_letters: "VEINTI TRES MIL OCHOCIENTOS PESOS 00/100" // Simplificado
      }
    });
  }
};
