import { useState, useEffect } from 'react';
import { invoiceService } from '../../services/invoiceService';
import { getProducts } from '../../services/apiService';

export default function InvoiceForm({
  formData, onAddItem, onRemoveItem, onUpdateItem,
  onFieldChange, onPrint, onSave, saving, company, totals
}) {
  const [newItem, setNewItem] = useState({
    code: '', description: '', quantity: 1, unit: 'UND',
    unit_price: 0, iva_rate: 0, cost: ''
  });
  const [activeTab, setActiveTab] = useState('items');
  const [savedProducts, setSavedProducts] = useState([]);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async (search = '') => {
    const params = { limit: 20 };
    if (search) params.search = search;
    const res = await getProducts(params);
    if (res.success) setSavedProducts(res.data);
  };

  const handleAddItem = () => {
    if (newItem.unit_price <= 0) {
      alert('El precio es obligatorio');
      return;
    }
    onAddItem(newItem);
    setNewItem({
      code: '', description: '', quantity: 1, unit: 'UND',
      unit_price: 0, iva_rate: 0, cost: ''
    });
  };

  const selectProduct = (product) => {
    setNewItem({
      code: product.code || '',
      description: product.description || '',
      quantity: 1,
      unit: product.unit || 'UND',
      unit_price: parseFloat(product.unit_price),
      iva_rate: parseFloat(product.iva_rate) || 0,
      cost: product.cost || ''
    });
    setShowProductSearch(false);
    setSearchTerm('');
  };

  const invoiceTotals = totals || invoiceService.calculateTotals(formData.items);

  const generateAndDownloadPDF = async () => {
    if (!formData.customer?.name) {
      alert('Ingrese el nombre del cliente');
      return;
    }
    if (formData.items.length === 0) {
      alert('Agregue al menos un producto');
      return;
    }

    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const invoiceNumber = `FE${Date.now().toString().slice(-8)}`;
    const today = new Date().toLocaleDateString('es-CO');

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(amount);
    };

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
      const labels = { credito: 'Crédito', mixto: 'Pago Mixto' };
      return labels[form] || 'Contado';
    };

    // ===== HEADER =====
    doc.setFillColor(128, 0, 128);
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Logo
    try {
      doc.addImage('/logoSF.png', 'PNG', 15, 8, 20, 20);
    } catch (e) {
      doc.setFillColor(100, 100, 100);
      doc.roundedRect(15, 8, 20, 20, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text('LOGO', 25, 20);
    }

    // Company info
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(company?.name || 'Mi Empresa', 40, 15);
    doc.setFontSize(9);
    doc.text(`NIT: ${company?.nit || '000.000.000-0'}`, 40, 22);
    doc.text(`${company?.address || 'Dirección'}`, 40, 28);

    // Invoice title
    doc.setFontSize(16);
    doc.text('FACTURA DE VENTA', pageWidth - 15, 15, { align: 'right' });
    doc.setFontSize(10);
    doc.text(`No. ${invoiceNumber}`, pageWidth - 15, 22, { align: 'right' });
    doc.text(`Fecha: ${today}`, pageWidth - 15, 28, { align: 'right' });

    // ===== DATOS CLIENTE =====
    let yPos = 45;
    doc.setTextColor(100, 0, 100);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL CLIENTE', 15, yPos);
    doc.setDrawColor(128, 0, 128);
    doc.line(15, yPos + 2, pageWidth - 15, yPos + 2);

    yPos += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const customer = formData.customer || {};
    doc.text(`Nombre: ${customer.name || '—'}`, 15, yPos);
    yPos += 6;
    doc.text(`NIT/Identificación: ${customer.identification || '—'}`, 15, yPos);
    yPos += 6;
    doc.text(`Teléfono: ${customer.phone || '—'}`, 15, yPos);
    yPos += 6;
    doc.text(`Correo: ${customer.email || '—'}`, 15, yPos);
    yPos += 6;
    doc.text(`Dirección: ${[customer.address, customer.municipality, customer.department].filter(Boolean).join(', ') || '—'}`, 15, yPos);

    // ===== TABLA PRODUCTOS =====
    yPos += 12;
    doc.setTextColor(100, 0, 100);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DETALLE DE PRODUCTOS', 15, yPos);
    doc.line(15, yPos + 2, pageWidth - 15, yPos + 2);

    yPos += 5;

    const tableData = formData.items.map((item) => [
      item.code || '—',
      item.description || 'Producto',
      item.quantity.toString(),
      formatCurrency(item.unit_price),
      `${item.iva_rate || 0}%`,
      formatCurrency(item.subtotal)
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Código', 'Descripción', 'Cant.', 'Precio Unit.', 'IVA', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [128, 0, 128],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 60 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 35, halign: 'right' }
      },
      alternateRowStyles: {
        fillColor: [245, 245, 250]
      },
      margin: { left: 15, right: 15 }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // ===== TOTALES =====
    doc.setFillColor(245, 245, 250);
    doc.roundedRect(pageWidth - 80, yPos - 5, 65, 40, 3, 3, 'F');

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Subtotal:', pageWidth - 75, yPos + 2);
    doc.text(formatCurrency(invoiceTotals.subtotal), pageWidth - 15, yPos + 2, { align: 'right' });

    yPos += 8;
    doc.text('IVA:', pageWidth - 75, yPos + 2);
    doc.text(formatCurrency(invoiceTotals.ivaAmount), pageWidth - 15, yPos + 2, { align: 'right' });

    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(128, 0, 128);
    doc.text('TOTAL:', pageWidth - 75, yPos + 2);
    doc.text(formatCurrency(invoiceTotals.total), pageWidth - 15, yPos + 2, { align: 'right' });

    // ===== MÉTODO DE PAGO =====
    yPos += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Método de Pago:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${getPaymentFormLabel(formData.payment_form)} - ${getPaymentMethodLabel(formData.payment_method)}`, 15, yPos + 6);

    // ===== NOTAS =====
    if (formData.notes) {
      yPos += 15;
      doc.setFont('helvetica', 'bold');
      doc.text('Notas:', 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const splitNotes = doc.splitTextToSize(formData.notes, pageWidth - 30);
      doc.text(splitNotes, 15, yPos + 6);
    }

    // ===== FOOTER =====
    const footerY = 270;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Sistema de Facturación Electrónica', pageWidth / 2, footerY, { align: 'center' });

    // Download
    doc.save(`Factura-${invoiceNumber}.pdf`);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Productos</h2>
        <div className="flex gap-2">
          {onSave && (
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {saving ? 'Guardando...' : 'Guardar Factura'}
            </button>
          )}
          <button
            onClick={generateAndDownloadPDF}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 font-medium ${activeTab === 'items' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}
        >
          Productos
        </button>
        <button
          onClick={() => setActiveTab('payment')}
          className={`px-4 py-2 font-medium ${activeTab === 'payment' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}
        >
          Pago
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 font-medium ${activeTab === 'notes' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}
        >
          Notas
        </button>
      </div>

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {/* Botón para buscar productos guardados */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowProductSearch(!showProductSearch)}
              className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm hover:bg-blue-100 transition"
            >
              {showProductSearch ? 'Ocultar catálogo' : 'Buscar en catálogo'}
            </button>
          </div>

          {/* Búsqueda de productos guardados */}
          {showProductSearch && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <input
                type="text"
                placeholder="Buscar productos guardados..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); loadProducts(e.target.value); }}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                autoFocus
              />
              {savedProducts.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {savedProducts.map(p => (
                    <button
                      key={p.id}
                      onClick={() => selectProduct(p)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-white rounded-lg hover:bg-blue-100 transition text-sm text-left"
                    >
                      <span className="font-medium truncate">
                        {p.code ? `[${p.code}] ` : ''}{p.description || 'Producto'}
                      </span>
                      <span className="text-gray-500 shrink-0 ml-2">
                        ${parseFloat(p.unit_price).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {savedProducts.length === 0 && searchTerm && (
                <p className="text-sm text-gray-400 text-center">Sin resultados</p>
              )}
            </div>
          )}

          {/* Add Item Form */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="text"
              placeholder="Código"
              value={newItem.code}
              onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Descripción"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm md:col-span-2"
            />
            <input
              type="number"
              placeholder="Cant."
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Precio *"
              value={newItem.unit_price || ''}
              onChange={(e) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <select
              value={newItem.iva_rate}
              onChange={(e) => setNewItem({ ...newItem, iva_rate: parseFloat(e.target.value) })}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value={0}>0%</option>
              <option value={5}>5%</option>
              <option value={19}>19%</option>
            </select>
            <button
              onClick={handleAddItem}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
            >
              Agregar
            </button>
          </div>

          {/* Items Table */}
          {formData.items.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Código</th>
                  <th className="px-3 py-2 text-left">Descripción</th>
                  <th className="px-3 py-2 text-right">Cant.</th>
                  <th className="px-3 py-2 text-right">Precio</th>
                  <th className="px-3 py-2 text-right">IVA</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-3 py-2">{item.code || '—'}</td>
                    <td className="px-3 py-2">{item.description || '—'}</td>
                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">{invoiceService.formatCurrency(item.unit_price)}</td>
                    <td className="px-3 py-2 text-right">{item.iva_rate}%</td>
                    <td className="px-3 py-2 text-right font-medium">{invoiceService.formatCurrency(item.total)}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-medium">
                <tr>
                  <td colSpan={5} className="px-3 py-2 text-right">Total:</td>
                  <td className="px-3 py-2 text-right">{invoiceService.formatCurrency(totals.total)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p className="text-center text-gray-400 py-4">No hay productos agregados</p>
          )}
        </div>
      )}

      {/* Payment Tab */}
      {activeTab === 'payment' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pago</label>
            <select
              value={formData.payment_form}
              onChange={(e) => onFieldChange('payment_form', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="contado">Contado</option>
              <option value="credito">Crédito</option>
              <option value="mixto">Mixto</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
            <select
              value={formData.payment_method}
              onChange={(e) => onFieldChange('payment_method', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="cheque">Cheque</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
            <select
              value={formData.currency}
              onChange={(e) => onFieldChange('currency', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="COP">Peso Colombiano (COP)</option>
              <option value="USD">Dólar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Observaciones</label>
            <textarea
              value={formData.notes}
              onChange={(e) => onFieldChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Notas adicionales..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Términos y Condiciones</label>
            <textarea
              value={formData.terms}
              onChange={(e) => onFieldChange('terms', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Términos de pago, garantías, etc."
            />
          </div>
        </div>
      )}
    </div>
  );
}
