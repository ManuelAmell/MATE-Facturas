import { useState, useEffect } from 'react';
import { getCompany, updateCompany } from '../../services/apiService';
import CompanyPreview from './CompanyPreview';

export default function CompanySettings({ onSave, onClose }) {
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState({
    name: '', nit: '', phone: '', address: '', municipality: '',
    email: '', department: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    const res = await getCompany();
    if (res.success && res.data) {
      const c = res.data;
      setCompany(c);
      setForm({
        name: c.name || '',
        nit: c.nit || '',
        phone: c.phone || '',
        address: c.address || '',
        municipality: c.municipality || '',
        email: c.email || '',
        department: c.department || ''
      });
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!company) {
      alert('No hay empresa configurada');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const res = await updateCompany(company.id, form);
      if (res.success) {
        setCompany(res.data);
        setMessage('Datos guardados correctamente');
        if (onSave) {
          onSave(res.data);
        }
        // Cerrar modal después de 1 segundo
        setTimeout(() => {
          if (onClose) onClose();
        }, 1000);
      } else {
        setMessage('Error al guardar: ' + (res.message || 'desconocido'));
      }
    } catch (error) {
      setMessage('Error de conexión');
    }
    setSaving(false);
  };

  const previewCompany = company ? { ...company, ...form } : form;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Información de la Empresa
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre / Razón Social</label>
            <input
              type="text" value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Nombre de la empresa"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIT</label>
              <input
                type="text" value={form.nit}
                onChange={e => handleChange('nit', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="000.000.000-0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="text" value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="+57 300 000 0000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input
              type="text" value={form.address}
              onChange={e => handleChange('address', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Carrera 00 # 00-00"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input
                type="text" value={form.municipality}
                onChange={e => handleChange('municipality', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Medellín"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
              <input
                type="text" value={form.department}
                onChange={e => handleChange('department', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Antioquia"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email" value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="contacto@empresa.com"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition font-medium"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

        {/* Previsualización en vivo */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
            Vista Previa
          </h3>
          <CompanyPreview company={previewCompany} />
          <p className="text-xs text-gray-400 mt-2 text-center">
            La vista previa se actualiza automáticamente mientras escribes
          </p>
        </div>
      </div>
    </div>
  );
}
