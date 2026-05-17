import { useState, useEffect } from 'react';
import { getInvoices, getCustomersList } from '../../services/apiService';
import { downloadInvoicePDF } from '../../services/invoiceService';

export default function InvoiceHistory() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filters, setFilters] = useState({
    customer_id: '',
    search: '',
    status: '',
    start_date: '',
    end_date: ''
  });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [filters.customer_id, filters.status, filters.start_date, filters.end_date, pagination.page]);

  const loadCustomers = async () => {
    const res = await getCustomersList();
    if (res.success) {
      setCustomers(res.data || []);
    }
  };

  const loadInvoices = async () => {
    setLoading(true);
    const params = {
      page: pagination.page,
      limit: 10,
      customer_id: filters.customer_id || undefined,
      status: filters.status || undefined,
      start_date: filters.start_date || undefined,
      end_date: filters.end_date || undefined,
      search: filters.search || undefined
    };
    const res = await getInvoices(params);
    if (res.success) {
      setInvoices(res.data);
      setPagination(prev => ({ ...prev, ...res.pagination }));
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadInvoices();
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    if (field !== 'search') {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDownloadPDF = async (invoice) => {
    await downloadInvoicePDF(invoice.id);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pagada: 'bg-green-100 text-green-700',
      anulada: 'bg-red-100 text-red-700',
      pendiente: 'bg-yellow-100 text-yellow-700'
    };
    const labels = {
      pagada: 'Pagada',
      anulada: 'Anulada',
      pendiente: 'Pendiente'
    };
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pendiente}`}>
        {labels[status] || 'Pendiente'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Historial de Facturas</h2>
        <span className="text-sm text-gray-500">
          {pagination.total > 0 ? `${pagination.total} factura(s)` : ''}
        </span>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Cliente</label>
          <select
            value={filters.customer_id}
            onChange={e => handleFilterChange('customer_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los clientes</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>
        </div>
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Buscar</label>
          <input
            type="text"
            placeholder="Cliente o número de factura..."
            value={filters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
          <select
            value={filters.status}
            onChange={e => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagada">Pagada</option>
            <option value="anulada">Anulada</option>
          </select>
        </div>
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
          <input
            type="date"
            value={filters.start_date}
            onChange={e => handleFilterChange('start_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
          <input
            type="date"
            value={filters.end_date}
            onChange={e => handleFilterChange('end_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Botón buscar */}
      <div className="flex justify-end">
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Buscar
        </button>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl shadow-sm">
          No hay facturas registradas
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Número</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Estado</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{inv.invoice_number}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{inv.customer?.name || '—'}</p>
                    <p className="text-xs text-gray-500">{inv.customer?.identification || ''}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {formatCurrency(inv.total)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(inv.issue_date)}</td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(inv.status)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(inv)}
                        className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                      >
                        Descargar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page <= 1}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página <span className="font-medium">{pagination.page}</span> de <span className="font-medium">{pagination.pages}</span>
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                disabled={pagination.page >= pagination.pages}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal de Detalles */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Detalles de Factura</h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              {/* Datos principales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Número de Factura</p>
                  <p className="font-semibold text-gray-900">{selectedInvoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Estado</p>
                  {getStatusBadge(selectedInvoice.status)}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Fecha de Emisión</p>
                  <p className="text-gray-900">{formatDate(selectedInvoice.issue_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Forma de Pago</p>
                  <p className="text-gray-900 capitalize">{selectedInvoice.payment_form}</p>
                </div>
              </div>

              {/* Cliente */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Datos del Cliente</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Nombre</p>
                    <p className="font-medium">{selectedInvoice.customer?.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">NIT/Identificación</p>
                    <p className="font-medium">{selectedInvoice.customer?.identification || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{selectedInvoice.customer?.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Teléfono</p>
                    <p className="font-medium">{selectedInvoice.customer?.phone || '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Dirección</p>
                    <p className="font-medium">{selectedInvoice.customer?.address || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Items</h4>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-2 text-left text-xs text-gray-500">Descripción</th>
                        <th className="px-2 py-2 text-right text-xs text-gray-500">Cant.</th>
                        <th className="px-2 py-2 text-right text-xs text-gray-500">Precio</th>
                        <th className="px-2 py-2 text-right text-xs text-gray-500">IVA</th>
                        <th className="px-2 py-2 text-right text-xs text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-2 py-2">{item.description}</td>
                          <td className="px-2 py-2 text-right">{item.quantity}</td>
                          <td className="px-2 py-2 text-right">{formatCurrency(item.unit_price)}</td>
                          <td className="px-2 py-2 text-right">{item.iva_rate}%</td>
                          <td className="px-2 py-2 text-right font-medium">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totales */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium">{formatCurrency(selectedInvoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">IVA</span>
                      <span className="font-medium">{formatCurrency(selectedInvoice.iva_amount)}</span>
                    </div>
                    {selectedInvoice.discount_amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Descuento</span>
                        <span className="font-medium text-red-600">-{formatCurrency(selectedInvoice.discount_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 font-bold text-base">
                      <span>Total</span>
                      <span>{formatCurrency(selectedInvoice.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Datos DIAN */}
              {selectedInvoice.cufe && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Información DIAN</h4>
                  <div className="text-xs space-y-1">
                    <p><span className="text-gray-500">CUFE:</span> <span className="font-mono text-gray-700">{selectedInvoice.cufe}</span></p>
                    {selectedInvoice.uuid && <p><span className="text-gray-500">UUID:</span> <span className="font-mono text-gray-700">{selectedInvoice.uuid}</span></p>}
                  </div>
                </div>
              )}

              {/* Notas */}
              {selectedInvoice.notes && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Notas</h4>
                  <p className="text-sm text-gray-600">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => handleDownloadPDF(selectedInvoice)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}