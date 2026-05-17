import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/apiService';

const emptyProduct = {
  code: '', description: '', unit_price: '', unit: 'UND', iva_rate: 0, cost: ''
};

export default function ProductsManager({ companyId }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ ...emptyProduct });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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

  const handleSearch = () => {
    loadProducts(search);
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
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ ...emptyProduct });
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
    if (!confirm('¿Desactivar este producto?')) return;
    const res = await deleteProduct(id);
    if (res.success) loadProducts(search);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={handleSearch}
          className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition"
        >
          Buscar
        </button>
        <button
          onClick={() => { setEditingId(null); setForm({ ...emptyProduct }); }}
          className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition"
        >
          + Nuevo
        </button>
      </div>

      {/* Formulario de producto */}
      {(editingId || (!editingId && form.unit_price !== '')) && (
        <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input
              type="text" placeholder="Código (opcional)"
              value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="text" placeholder="Descripción (opcional)"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="number" step="0.01" placeholder="Precio *"
              value={form.unit_price}
              onChange={e => setForm({ ...form, unit_price: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="number" step="0.01" placeholder="Costo (opcional)"
              value={form.cost}
              onChange={e => setForm({ ...form, cost: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <select
              value={form.unit}
              onChange={e => setForm({ ...form, unit: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="UND">Unidad (UND)</option>
              <option value="KG">Kilogramo (KG)</option>
              <option value="LB">Libra (LB)</option>
              <option value="BLS">Bolsa (BLS)</option>
              <option value="GLF">Garrafón (GLF)</option>
              <option value="MTS">Metro (MTS)</option>
              <option value="LTS">Litro (LTS)</option>
              <option value="CJA">Caja (CJA)</option>
            </select>
            <select
              value={form.iva_rate}
              onChange={e => setForm({ ...form, iva_rate: parseFloat(e.target.value) })}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value={0}>0% (Exento)</option>
              <option value={5}>5%</option>
              <option value={19}>19%</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition"
              >
                {editingId ? 'Actualizar' : 'Agregar'}
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de productos */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Cargando...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No hay productos registrados. Crea tu primer producto.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Código</th>
                <th className="px-3 py-2 text-left">Descripción</th>
                <th className="px-3 py-2 text-right">Precio</th>
                <th className="px-3 py-2 text-right">IVA</th>
                <th className="px-3 py-2 text-right">Costo</th>
                <th className="px-3 py-2 text-right">Margen</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const cost = parseFloat(p.cost) || 0;
                const price = parseFloat(p.unit_price) || 0;
                const margin = cost > 0 ? ((price - cost) / price * 100).toFixed(1) : '—';
                return (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">{p.code || '—'}</td>
                    <td className="px-3 py-2">{p.description || '—'}</td>
                    <td className="px-3 py-2 text-right font-medium">
                      ${parseFloat(p.unit_price).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2 text-right">{p.iva_rate}%</td>
                    <td className="px-3 py-2 text-right text-gray-500">
                      {p.cost ? `$${parseFloat(p.cost).toLocaleString('es-CO', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={margin !== '—' && parseFloat(margin) < 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                        {margin !== '—' ? `${margin}%` : '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-blue-600 hover:text-blue-800 mr-2 text-xs"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
