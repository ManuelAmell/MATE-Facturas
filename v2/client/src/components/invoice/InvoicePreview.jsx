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
      <div className="bg-white p-4 mt-4 border border-gray-200">
        <div className="text-center text-sm text-gray-500 mb-3">
          Vista previa móvil - Activa el modo escritorio para mejor visualización
        </div>
        <div className="bg-gray-50 p-4 text-center">
          <p className="text-gray-400 text-sm">La previsualización completa se muestra en pantallas grandes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 max-w-5xl mx-auto">
      <div className="p-8">
        {/* ============================================================
            HEADER
            ============================================================ */}
        <div className="flex justify-between items-start border-b border-gray-300 pb-4 mb-6">
          {/* Izquierda: Logo + Empresa */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 border border-gray-200 flex items-center justify-center overflow-hidden">
              <img
                src="/logoSF.png"
                alt="Logo"
                className="h-12 w-12 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden items-center justify-center h-full w-full bg-gray-100 text-gray-500 font-bold text-lg">
                {company?.name?.charAt(0) || 'E'}
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{company?.name || 'Mi Empresa'}</h2>
              <p className="text-xs text-gray-500">NIT: {company?.nit || '000.000.000-0'}</p>
              <p className="text-xs text-gray-500">{company?.address || 'Carrera 00 # 00-00'}</p>
              <p className="text-xs text-gray-500">{company?.municipality || 'Bogotá D.C.'}</p>
            </div>
          </div>

          {/* Derecha: Título + Datos */}
          <div className="text-right">
            <h1 className="text-base font-bold text-gray-800 tracking-wide">FACTURA ELECTRÓNICA DE VENTA</h1>
            <p className="text-sm text-gray-600 mt-1">No. <span className="font-mono font-semibold">{invoiceNumber}</span></p>
            <p className="text-sm text-gray-600">Fecha: {today}</p>
            <p className="text-xs text-gray-400 mt-1">Estado: No guardada</p>
          </div>
        </div>

        {/* Resolución */}
        {company?.resolution_number && (
          <p className="text-xs text-gray-400 mb-6">
            Resolución DIAN: {company.resolution_number}
          </p>
        )}

        {/* ============================================================
            INFORMACIÓN GENERAL — 3 columnas
            ============================================================ */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* EMISOR */}
          <div>
            <h3 className="text-xs uppercase font-bold text-gray-700 mb-2 tracking-wider">Emisor</h3>
            <div className="space-y-1 text-sm">
              <p className="text-gray-800 font-medium">{company?.name || '—'}</p>
              <p className="text-gray-500 text-xs">NIT: {company?.nit || '—'}</p>
              <p className="text-gray-500 text-xs">{company?.address || '—'}</p>
              <p className="text-gray-500 text-xs">{company?.phone || '—'}</p>
            </div>
          </div>

          {/* CLIENTE */}
          <div>
            <h3 className="text-xs uppercase font-bold text-gray-700 mb-2 tracking-wider">Cliente</h3>
            <div className="space-y-1 text-sm">
              <p className="text-gray-800 font-medium">{customer?.name || '—'}</p>
              <p className="text-gray-500 text-xs">NIT: {customer?.identification || '—'}</p>
              <p className="text-gray-500 text-xs">{customer?.address || '—'}</p>
              <p className="text-gray-500 text-xs">{customer?.email || '—'}</p>
              <p className="text-gray-500 text-xs">{customer?.phone || '—'}</p>
            </div>
          </div>

          {/* PAGO */}
          <div>
            <h3 className="text-xs uppercase font-bold text-gray-700 mb-2 tracking-wider">Pago</h3>
            <div className="space-y-1 text-sm">
              <p className="text-gray-500 text-xs">Forma: <span className="text-gray-800">{getPaymentFormLabel(payment_form)}</span></p>
              <p className="text-gray-500 text-xs">Método: <span className="text-gray-800">{getPaymentMethodLabel(payment_method)}</span></p>
              <p className="text-gray-500 text-xs">Moneda: <span className="text-gray-800">{currency || 'COP'}</span></p>
            </div>
          </div>
        </div>

        {/* ============================================================
            TABLA DE PRODUCTOS
            ============================================================ */}
        <div className="mb-6">
          {items.length > 0 ? (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-3 py-2 text-left text-xs font-semibold border-b border-gray-200">#</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold border-b border-gray-200">Código</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold border-b border-gray-200">Descripción</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold border-b border-gray-200">Cant.</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold border-b border-gray-200">Precio</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold border-b border-gray-200">IVA</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold border-b border-gray-200">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-gray-600">{index + 1}</td>
                    <td className="px-3 py-2 text-gray-600">{item.code || '—'}</td>
                    <td className="px-3 py-2 text-gray-800">{item.description || 'Producto'}</td>
                    <td className="px-3 py-2 text-right text-gray-600">{item.quantity}</td>
                    <td className="px-3 py-2 text-right text-gray-600">{formatCurrency(item.unit_price)}</td>
                    <td className="px-3 py-2 text-right text-gray-600">{item.iva_rate || 0}%</td>
                    <td className="px-3 py-2 text-right font-medium text-gray-800">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-sm">No hay productos agregados</p>
            </div>
          )}
        </div>

        {/* ============================================================
            TOTALES
            ============================================================ */}
        <div className="flex justify-end mb-6">
          <div className="w-72">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>IVA ({totals.baseIva > 0 ? '19%' : '0%'}):</span>
                <span className="font-medium">{formatCurrency(totals.ivaAmount)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                <span>TOTAL A PAGAR:</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            VALOR EN LETRAS
            ============================================================ */}
        {totals.totalLetters && (
          <div className="mb-6">
            <h3 className="text-xs uppercase font-bold text-gray-700 mb-1 tracking-wider">Valor en Letras</h3>
            <p className="text-sm text-gray-600">{totals.totalLetters}</p>
          </div>
        )}

        {/* ============================================================
            NOTAS Y TÉRMINOS
            ============================================================ */}
        {(notes || terms) && (
          <div className="mb-6 space-y-4">
            {notes && (
              <div>
                <h3 className="text-xs uppercase font-bold text-gray-700 mb-1 tracking-wider">Notas</h3>
                <p className="text-sm text-gray-600">{notes}</p>
              </div>
            )}
            {terms && (
              <div>
                <h3 className="text-xs uppercase font-bold text-gray-700 mb-1 tracking-wider">Términos</h3>
                <p className="text-sm text-gray-600">{terms}</p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            FOOTER
            ============================================================ */}
            <img src="/MetodoPago.png" alt="Logo" className="mx-auto mb-2" />
        <div className="border-t border-gray-200 pt-4 text-center">
          <p className="text-xs text-gray-400">
            Esta factura es un documento electrónico de venta según normativa DIAN.
          </p>
        </div>
      </div>
    </div>
  );
}
