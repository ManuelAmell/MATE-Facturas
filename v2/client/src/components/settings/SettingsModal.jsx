import { useState, useEffect } from 'react';
import CompanySettings from './CompanySettings';
import ProductsManager from './ProductsManager';
import { getCompany } from '../../services/apiService';

export default function SettingsModal({ isOpen, onClose, onCompanyUpdate }) {
  const [activeTab, setActiveTab] = useState('company');
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    if (isOpen) loadCompanyId();
  }, [isOpen]);

  const loadCompanyId = async () => {
    const res = await getCompany();
    if (res.success && res.data) {
      setCompanyId(res.data.id);
    }
  };

  const handleCompanySaved = (updatedCompany) => {
    if (onCompanyUpdate) {
      onCompanyUpdate(updatedCompany);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-xl shadow-2xl w-[95%] max-w-4xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Configuración</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          <button
            onClick={() => setActiveTab('company')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === 'company'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Empresa
            </span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === 'products'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Productos
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 120px)' }}>
          {activeTab === 'company' && <CompanySettings onSave={handleCompanySaved} onClose={onClose} />}
          {activeTab === 'products' && <ProductsManager companyId={companyId} />}
        </div>
      </div>
    </div>
  );
}
