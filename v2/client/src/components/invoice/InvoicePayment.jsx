const paymentFormLabels = {
  contado: 'Contado',
  credito: 'Crédito',
  mixto: 'Mixto'
};

const paymentMethodLabels = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  cheque: 'Cheque',
  tarjeta: 'Tarjeta de Débito/Crédito',
  otro: 'Otro'
};

const currencyLabels = {
  COP: 'Peso Colombiano',
  USD: 'Dólar Americano',
  EUR: 'Euro'
};

export default function InvoicePayment({ payment_form, payment_method, currency, totalItems }) {
  return (
    <div className="invoice-section bg-gray-50">
      <div className="flex flex-wrap gap-4 text-sm">
        <div>
          <span className="text-gray-500">Forma de Pago:</span>
          <span className="font-medium ml-1">{paymentFormLabels[payment_form] || payment_form}</span>
        </div>
        <div>
          <span className="text-gray-500">Método de Pago:</span>
          <span className="font-medium ml-1">{paymentMethodLabels[payment_method] || payment_method}</span>
        </div>
        <div>
          <span className="text-gray-500">Moneda:</span>
          <span className="font-medium ml-1">{currencyLabels[currency] || currency}</span>
        </div>
        <div>
          <span className="text-gray-500">Total Ítems:</span>
          <span className="font-medium ml-1">{totalItems}</span>
        </div>
      </div>
    </div>
  );
}