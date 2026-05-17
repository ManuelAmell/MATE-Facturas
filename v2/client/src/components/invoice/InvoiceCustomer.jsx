export default function InvoiceCustomer({ customer }) {
  return (
    <div className="invoice-section">
      <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Información del Cliente</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <div className="col-span-2">
          <span className="text-gray-500">Nombre/Razón Social:</span>
          <p className="font-medium">{customer?.name || '-'}</p>
        </div>
        {customer?.commercial_name && (
          <div className="col-span-2">
            <span className="text-gray-500">Nombre Comercial:</span>
            <p className="font-medium">{customer.commercial_name}</p>
          </div>
        )}
        <div>
          <span className="text-gray-500">Identificación:</span>
          <p className="font-medium">
            {customer?.identification_type || 'NIT'}: {customer?.identification || '-'}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Correo:</span>
          <p className="font-medium">{customer?.email || '-'}</p>
        </div>
        <div>
          <span className="text-gray-500">Teléfono:</span>
          <p className="font-medium">{customer?.phone || '-'}</p>
        </div>
        <div>
          <span className="text-gray-500">Responsabilidad:</span>
          <p className="font-medium">{customer?.tax_responsibility || '-'}</p>
        </div>
        <div className="col-span-2">
          <span className="text-gray-500">Dirección:</span>
          <p className="font-medium">
            {customer?.address || '-'}
            {customer?.municipality ? `, ${customer.municipality}` : ''}
            {customer?.department ? `, ${customer.department}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
}