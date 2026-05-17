import { useState, useEffect } from 'react';
import { getInvoices, getCustomersList, getInvoiceById } from '../../services/apiService';
import { downloadInvoicePDF } from '../../services/invoiceService';
import InvoicePreview from './InvoicePreview';

export default function InvoiceHistory() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [filters, setFilters] = useState({
    customer_id: '',
    search: '',
    status: '',
    start_date: '',
    end_date: ''
  });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [searchTrigger, setSearchTrigger] = useState(0);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [filters.customer_id, filters.status, filters.start_date, filters.end_date, pagination.page, filters.search, searchTrigger]);

  const loadCustomers = async () => {
    try {
      const res = await getCustomersList();
      if (res.success) {
        setCustomers(res.data || []);
      }
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  const loadInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
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
        setInvoices(res.data || []);
        setPagination(prev => ({ ...prev, ...res.pagination }));
      } else {
        setError(res.message || 'Error al cargar facturas');
      }
    } catch (err) {
      console.error('Error loading invoices:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setSearchTrigger(prev => prev + 1);
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
    const result = await downloadInvoicePDF(invoice);
    if (!result.success) {
      setError(result.message || 'Error al descargar PDF');
    }
  };

  const handleViewInvoice = async (invoice) => {
    setLoadingDetail(true);
    const res = await getInvoiceById(invoice.id);
    if (res.success) {
      setSelectedInvoice(res.data);
    } else {
      setError(res.message || 'Error al cargar detalles');
    }
    setLoadingDetail(false);
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

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

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
                        onClick={() => handleViewInvoice(inv)}
                        disabled={loadingDetail}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {loadingDetail ? '...' : 'Ver'}
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
          <div className="bg-white max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Detalles de Factura</h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* InvoicePreview con datos mapeados */}
            <InvoicePreview
              company={selectedInvoice.company}
              customer={selectedInvoice.customer}
              items={selectedInvoice.items}
              totals={{
                subtotal: selectedInvoice.subtotal,
                totalDiscount: selectedInvoice.discount_amount,
                baseIva: selectedInvoice.base_iva,
                ivaAmount: selectedInvoice.iva_amount,
                total: selectedInvoice.total,
                totalLetters: selectedInvoice.total_letters
              }}
              payment_form={selectedInvoice.payment_form}
              payment_method={selectedInvoice.payment_method}
              currency={selectedInvoice.currency}
              notes={selectedInvoice.notes}
              terms={selectedInvoice.terms}
            />

            {/* Footer del modal */}
            <div className="flex justify-end gap-3 px-6 py-3 border-t border-gray-200">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => handleDownloadPDF(selectedInvoice)}
                className="px-4 py-2 bg-gray-800 text-white rounded text-sm font-medium hover:bg-gray-900 transition-colors"
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