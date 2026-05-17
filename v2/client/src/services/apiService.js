const API_URL = '/api';

async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return { success: false, message: error.message };
  }
}

// Company
export const getCompany = () => fetchAPI('/company');
export const updateCompany = (id, data) => fetchAPI(`/company/${id}`, {
  method: 'PUT', body: JSON.stringify(data)
});

// Products
export const getProducts = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetchAPI(`/products?${query}`);
};
export const createProduct = (data) => fetchAPI('/products', {
  method: 'POST', body: JSON.stringify(data)
});
export const updateProduct = (id, data) => fetchAPI(`/products/${id}`, {
  method: 'PUT', body: JSON.stringify(data)
});
export const deleteProduct = (id) => fetchAPI(`/products/${id}`, {
  method: 'DELETE'
});

// Customers
export const getCustomers = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetchAPI(`/customers?${query}`);
};
export const createCustomer = (data) => fetchAPI('/customers', {
  method: 'POST', body: JSON.stringify(data)
});
export const findOrCreateCustomer = (data) => fetchAPI('/customers/find-or-create', {
  method: 'POST', body: JSON.stringify(data)
});
export const getCustomersList = () => fetchAPI('/customers/list');

// Invoices
export const getInvoices = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetchAPI(`/invoices?${query}`);
};
export const getInvoiceById = (id) => fetchAPI(`/invoices/${id}`);
export const createInvoice = (data) => fetchAPI('/invoices', {
  method: 'POST', body: JSON.stringify(data)
});
