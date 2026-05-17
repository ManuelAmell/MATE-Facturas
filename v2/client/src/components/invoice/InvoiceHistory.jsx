import { useState, useEffect } from 'react';
import { getInvoices } from '../../services/apiService';

export default function InvoiceHistory() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '', status: '', start_date: '', end_date: ''
  });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  useEffect(() => {
    loadInvoices();
  }, [filters.status, filters.start_date, filters.end_date, pagination.page]);

  const loadInvoices = async () => {
    setLoading(true);
    const params = {
      page: pagination.page,
      limit: 15,
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
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-CO');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Historial de Facturas</h2>
        <span className="text-sm text-gray-500">
          {pagination.total > 0 ? `${pagination.total} factura(s)` : ''}
        </span>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Buscar por cliente, NIT o número de factura..."
            value={filters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div>
          <select
            value={filters.status}
            onChange={e => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagada">Pagada</option>
            <option value="anulada">Anulada</option>
          </select>
        </div>
        <div>
          <input
            type="date"
            value={filters.start_date}
            onChange={e => handleFilterChange('start_date', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div>
          <input
            type="date"
            value={filters.end_date}
            onChange={e => handleFilterChange('end_date', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            onBlur={handleSearch}
          />
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl shadow-sm">
          No hay facturas registradas
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Factura</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Pago</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{inv.invoice_number}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{inv.customer?.name || '—'}</p>
                    <p className="text-xs text-gray-400">{inv.customer?.identification || ''}</p>
                  </td>
                  <td className="px-4 py-3">{formatDate(inv.issue_date)}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(inv.total)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      inv.status === 'pagada' ? 'bg-green-100 text-green-700' :
                      inv.status === 'anulada' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {inv.status === 'pagada' ? 'Pagada' :
                       inv.status === 'anulada' ? 'Anulada' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500 text-xs">
                    {inv.payment_method}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page <= 1}
                className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {pagination.page} de {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
