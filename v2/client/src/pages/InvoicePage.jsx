import { useState, useEffect } from 'react';
import InvoiceForm from '../components/invoice/InvoiceForm';
import InvoicePreview from '../components/invoice/InvoicePreview';
import CustomerForm from '../components/invoice/CustomerForm';
import { invoiceService } from '../services/invoiceService';
import { createInvoice } from '../services/apiService';

export default function InvoicePage({ company }) {
  const [formData, setFormData] = useState({
    company: null,
    customer: null,
    items: [],
    payment_form: 'contado',
    payment_method: 'efectivo',
    currency: 'COP',
    notes: '',
    terms: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (company) {
      setFormData(prev => ({ ...prev, company }));
    }
  }, [company]);

  const handleCustomerChange = (customer) => {
    setFormData(prev => ({ ...prev, customer }));
  };

  const handleAddItem = (item) => {
    const newItem = {
      ...item,
      id: `item-${Date.now()}`,
      subtotal: item.quantity * item.unit_price,
      iva_amount: (item.quantity * item.unit_price) * (item.iva_rate / 100),
      total: (item.quantity * item.unit_price) * (1 + item.iva_rate / 100)
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleRemoveItem = (id) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleUpdateItem = (id, updates) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          updated.subtotal = updated.quantity * updated.unit_price;
          updated.iva_amount = updated.subtotal * (updated.iva_rate / 100);
          updated.total = updated.subtotal + updated.iva_amount;
          return updated;
        }
        return item;
      })
    }));
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveInvoice = async () => {
    if (!formData.customer?.name) {
      alert('Ingrese el nombre del cliente');
      return;
    }
    if (formData.items.length === 0) {
      alert('Agregue al menos un producto');
      return;
    }
    if (!company) {
      alert('No hay empresaemisora configurada');
      return;
    }

    setSaving(true);
    setMessage('');

    const invoicePayload = {
      company_id: company.id,
      customer: {
        company_id: company.id,
        name: formData.customer.name,
        identification: formData.customer.identification || 'Pendiente',
        email: formData.customer.email,
        phone: formData.customer.phone,
        address: formData.customer.address,
        municipality: formData.customer.municipality,
        department: formData.customer.department
      },
      issue_date: new Date().toISOString().split('T')[0],
      payment_form: formData.payment_form,
      payment_method: formData.payment_method,
      currency: formData.currency,
      notes: formData.notes,
      terms: formData.terms,
      items: formData.items.map((item, index) => ({
        line_number: index + 1,
        code: item.code,
        description: item.description || 'Producto',
        quantity: item.quantity,
        unit: item.unit || 'UND',
        unit_price: item.unit_price,
        iva_rate: item.iva_rate || 0,
        discount_percent: item.discount_percent || 0
      }))
    };

    const res = await createInvoice(invoicePayload);
    if (res.success) {
      setMessage('Factura creada exitosamente');
      setFormData(prev => ({
        ...prev,
        customer: null,
        items: [],
        notes: '',
        terms: ''
      }));
    } else {
      setMessage('Error: ' + (res.message || 'No se pudo crear la factura'));
    }
    setSaving(false);
  };

  const totals = invoiceService.calculateTotals(formData.items);

  return (
    <div className="space-y-6">
      {/* Mensaje */}
      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${
          message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      {/* Layout de dos columnas: Formulario + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda: Formularios */}
        <div className="space-y-6">
          <CustomerForm
            customer={formData.customer}
            onChange={handleCustomerChange}
          />

          <div className="no-print">
            <InvoiceForm
              formData={formData}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onUpdateItem={handleUpdateItem}
              onFieldChange={handleFieldChange}
              onPrint={handlePrint}
              onSave={handleSaveInvoice}
              saving={saving}
              company={company}
              totals={totals}
            />
          </div>
        </div>

        {/* Columna Derecha: Preview de Factura */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <InvoicePreview
              company={company}
              customer={formData.customer}
              items={formData.items}
              totals={totals}
              payment_form={formData.payment_form}
              payment_method={formData.payment_method}
              currency={formData.currency}
              notes={formData.notes}
              terms={formData.terms}
            />
          </div>
        </div>
      </div>

      {/* Preview móvil (debajo del formulario) */}
      <div className="lg:hidden">
        <InvoicePreview
          company={company}
          customer={formData.customer}
          items={formData.items}
          totals={totals}
          payment_form={formData.payment_form}
          payment_method={formData.payment_method}
          currency={formData.currency}
          notes={formData.notes}
          terms={formData.terms}
          isMobile={true}
        />
      </div>
    </div>
  );
}
