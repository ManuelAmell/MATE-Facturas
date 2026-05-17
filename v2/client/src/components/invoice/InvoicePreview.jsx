import { useState, useEffect } from 'react';
import { invoiceService } from '../../services/invoiceService';

export default function InvoicePreview({
  company,
  customer,
  items,
  totals,
  payment_form,
  payment_method,
  currency,
  notes,
  terms,
  isMobile = false
}) {
  const [invoiceNumber] = useState(() => `FE${Date.now().toString().slice(-8)}`);
  const today = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getPaymentMethodLabel = (method) => {
    const labels = {
      efectivo: 'Efectivo',
      transferencia: 'Transferencia Bancaria',
      cheque: 'Cheque',
      tarjeta: 'Tarjeta Débito/Crédito'
    };
    return labels[method] || method;
  };

  const getPaymentFormLabel = (form) => {
    const labels = {
      credito: 'Crédito',
      mixto: 'Pago Mixto'
    };
    return labels[form] || 'Contado';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isMobile) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 mt-4 border border-gray-100">
        <div className="text-center text-sm text-gray-500 mb-3">
          Vista previa móvil - Activa el modo escritorio para mejor visualización
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">La previsualización completa se muestra en pantallas grandes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 transition-all duration-300">
      {/* Contenido de la Factura estilo A4 */}
      <div className="relative">
        <div className="p-6 bg-white min-h-[600px] max-h-[800px] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-purple-600">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                <img
                  src="/logoSF.png"
                  alt="Logo"
                  className="h-14 w-14 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling?.style && (e.target.nextSibling.style.display = 'flex');
                  }}
                />
                <div className="hidden items-center justify-center h-full w-full bg-purple-600 text-white font-bold text-xl">
                  {company?.name?.charAt(0) || 'E'}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">{company?.name || 'Mi Empresa'}</h2>
                <p className="text-xs text-gray-500">NIT: {company?.nit || '000.000.000-0'}</p>
                <p className="text-xs text-gray-500">{company?.address || 'Carrera 00 # 00-00'}</p>
                <p className="text-xs text-gray-500">{company?.municipality || 'Bogotá D.C.'}</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold text-purple-700">FACTURA DE VENTA</h1>
              <p className="text-sm text-gray-600 mt-1">No. <span className="font-mono font-semibold">{invoiceNumber}</span></p>
              <p className="text-sm text-gray-600">Fecha: {today}</p>
              <p className="text-xs text-gray-400 mt-1">Estado: No guardada</p>
            </div>
          </div>

          {/* Datos del Cliente */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-purple-700 mb-2 border-b pb-1">DATOS DEL CLIENTE</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500 text-xs">Nombre:</span>
                <p className="font-medium text-gray-800">{customer?.name || '—'}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">NIT / Identificación:</span>
                <p className="font-medium text-gray-800">{customer?.identification || '—'}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Teléfono:</span>
                <p className="font-medium text-gray-800">{customer?.phone || '—'}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Correo:</span>
                <p className="font-medium text-gray-800">{customer?.email || '—'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 text-xs">Dirección:</span>
                <p className="font-medium text-gray-800">
                  {[customer?.address, customer?.municipality, customer?.department].filter(Boolean).join(', ') || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Tabla de Productos */}
          <div className="mb-6 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-purple-600 text-white">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold">Código</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold">Descripción</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold">Cant.</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold">Precio</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold">IVA</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <tr key={item.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-gray-600">{item.code || '—'}</td>
                      <td className="px-3 py-2 text-gray-800 font-medium">{item.description || 'Producto'}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{item.quantity}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{formatCurrency(item.unit_price)}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{item.iva_rate || 0}%</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-800">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span>No hay productos agregados</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className="flex justify-end mb-6">
            <div className="w-64">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IVA ({totals.baseIva > 0 ? '19%' : '0%'}):</span>
                  <span className="font-medium">{formatCurrency(totals.ivaAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-purple-700 pt-2 border-t border-purple-200">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Método de Pago y Notas */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-1">Método de Pago</h4>
              <p className="text-gray-600">
                {getPaymentFormLabel(payment_form)} - {getPaymentMethodLabel(payment_method)}
              </p>
            </div>
            {notes && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-1">Notas</h4>
                <p className="text-gray-600 text-xs">{notes}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
            <p>Sistema de Facturación Electrónica - Previsualización en tiempo real</p>
          </div>
        </div>
      </div>
    </div>
  );
}