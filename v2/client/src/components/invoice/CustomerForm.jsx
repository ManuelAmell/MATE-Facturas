export default function CustomerForm({ customer, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...customer, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Datos del Cliente
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre / Razón Social <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={customer?.name || ''}
            onChange={e => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="Nombre del cliente"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">NIT / Identificación</label>
          <input
            type="text"
            value={customer?.identification || ''}
            onChange={e => handleChange('identification', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="000.000.000-0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input
            type="text"
            value={customer?.phone || ''}
            onChange={e => handleChange('phone', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="+57 300 000 0000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
          <input
            type="email"
            value={customer?.email || ''}
            onChange={e => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="cliente@correo.com"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <input
            type="text"
            value={customer?.address || ''}
            onChange={e => handleChange('address', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="Calle 00 # 00-00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
          <input
            type="text"
            value={customer?.municipality || ''}
            onChange={e => handleChange('municipality', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="Medellín"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
          <input
            type="text"
            value={customer?.department || ''}
            onChange={e => handleChange('department', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="Antioquia"
          />
        </div>
      </div>
    </div>
  );
}
