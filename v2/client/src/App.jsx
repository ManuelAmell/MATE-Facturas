import { useState, useEffect } from 'react';
import InvoicePage from './pages/InvoicePage';
import InvoiceHistory from './components/invoice/InvoiceHistory';
import SettingsModal from './components/settings/SettingsModal';
import { getCompany } from './services/apiService';

function App() {
  const [activeView, setActiveView] = useState('invoice');
  const [showSettings, setShowSettings] = useState(false);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    const res = await getCompany();
    if (res.success && res.data) {
      setCompany(res.data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg no-print">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Title */}
            <div className="flex items-center gap-3">
              <img src="/logoF.png" alt="Logo" className="h-10 w-auto rounded" />
              <h1 className="text-xl font-bold">MATE Facturas</h1>
            </div>

            {/* Navigation + Settings */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView('invoice')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeView === 'invoice'
                    ? 'bg-white/20 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Facturar
                </span>
              </button>
              <button
                onClick={() => setActiveView('history')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeView === 'history'
                    ? 'bg-white/20 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Historial
                </span>
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition ml-2"
                title="Configuración"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {activeView === 'invoice' && <InvoicePage company={company} />}
        {activeView === 'history' && <InvoiceHistory />}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-500 text-xs no-print">
        <p>Sistema de Facturación Electrónica MATE - Versión 1.0.0</p>
      </footer>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        onCompanyUpdate={setCompany}
      />
    </div>
  );
}

export default App;
