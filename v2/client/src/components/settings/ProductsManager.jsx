import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/apiService';

const emptyProduct = {
  code: '', description: '', unit_price: '', unit: 'UND', iva_rate: 0, cost: ''
};

const units = [
  { value: 'UND', label: 'Unidad' },
  { value: 'KG', label: 'Kilogramo' },
  { value: 'LB', label: 'Libra' },
  { value: 'BLS', label: 'Bolsa' },
  { value: 'GLF', label: 'Garrafón' },
  { value: 'MTS', label: 'Metro' },
  { value: 'LTS', label: 'Litro' },
  { value: 'CJA', label: 'Caja' },
  { value: 'PAQ', label: 'Paquete' },
];

export default function ProductsManager({ companyId }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ ...emptyProduct });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (companyId) loadProducts();
  }, [companyId]);

  const loadProducts = async (term = '') => {
    setLoading(true);
    const params = { company_id: companyId };
    if (term) params.search = term;
    const res = await getProducts(params);
    if (res.success) setProducts(res.data);
    setLoading(false);
  };

  const handleSearch = () => loadProducts(search);

  const handleNew = () => {
    setEditingId(null);
    setForm({ ...emptyProduct });
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      code: product.code || '',
      description: product.description || '',
      unit_price: product.unit_price,
      unit: product.unit || 'UND',
      iva_rate: product.iva_rate || 0,
      cost: product.cost || ''
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ ...emptyProduct });
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.unit_price) {
      alert('El precio es obligatorio');
      return;
    }
    const payload = {
      company_id: companyId,
      code: form.code || null,
      description: form.description || null,
      unit_price: parseFloat(form.unit_price),
      unit: form.unit || 'UND',
      iva_rate: parseFloat(form.iva_rate) || 0,
      cost: form.cost ? parseFloat(form.cost) : null
    };

    let res;
    if (editingId) {
      res = await updateProduct(editingId, payload);
    } else {
      res = await createProduct(payload);
    }

    if (res.success) {
      handleCancel();
      loadProducts(search);
    } else {
      alert('Error: ' + (res.message || 'No se pudo guardar'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    const res = await deleteProduct(id);
    if (res.success) loadProducts(search);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Header con búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar por código o descripción..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); loadProducts(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={handleNew}
          className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Producto
        </button>
      </div>

      {/* Formulario de producto - Collapsible */}
      {showForm && (
        <div className="bg-white border border-purple-200 rounded-xl shadow-sm p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {editingId ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Código</label>
              <input
                type="text"
                placeholder="Ej: PROD-001"
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
              <input
                type="text"
                placeholder="Nombre del producto"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Precio *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                value={form.unit_price}
                onChange={e => setForm({ ...form, unit_price: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Unidad</label>
              <select
                value={form.unit}
                onChange={e => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              >
                {units.map(u => (
                  <option key={u.value} value={u.value}>{u.label} ({u.value})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">IVA</label>
              <select
                value={form.iva_rate}
                onChange={e => setForm({ ...form, iva_rate: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value={0}>0% (Exento)</option>
                <option value={5}>5%</option>
                <option value={19}>19%</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Costo (opcional)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                value={form.cost}
                onChange={e => setForm({ ...form, cost: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
            >
              {editingId ? 'Actualizar Producto' : 'Guardar Producto'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de productos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Cargando productos...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-500 font-medium">No hay productos registrados</p>
          <p className="text-gray-400 text-sm mt-1">Crea tu primer producto para comenzar</p>
          <button onClick={handleNew} className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm">
            + Crear primer producto
          </button>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Código</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Descripción</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Precio</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">IVA</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <span className="font-medium text-purple-600">{p.code || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-800">{p.description || 'Sin descripción'}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatCurrency(p.unit_price)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.iva_rate === 0 ? 'bg-green-100 text-green-700' :
                      p.iva_rate === 5 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {p.iva_rate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Activo
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-medium transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Contador */}
      {products.length > 0 && (
        <p className="text-sm text-gray-500 text-center">
          {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}