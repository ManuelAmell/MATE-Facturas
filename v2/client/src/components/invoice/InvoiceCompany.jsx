export default function InvoiceCompany({ company }) {
  return (
    <div className="invoice-section bg-gray-50">
      <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Información del Emisor</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Nombre:</span>
          <p className="font-medium">{company?.name || '-'}</p>
        </div>
        <div>
          <span className="text-gray-500">NIT:</span>
          <p className="font-medium">{company?.nit || '-'}</p>
        </div>
        <div>
          <span className="text-gray-500">Correo:</span>
          <p className="font-medium">{company?.email || '-'}</p>
        </div>
        <div>
          <span className="text-gray-500">Teléfono:</span>
          <p className="font-medium">{company?.phone || '-'}</p>
        </div>
        <div className="col-span-2">
          <span className="text-gray-500">Dirección:</span>
          <p className="font-medium">
            {company?.address || '-'}
            {company?.municipality ? `, ${company.municipality}` : ''}
            {company?.department ? `, ${company.department}` : ''}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Responsabilidad:</span>
          <p className="font-medium">{company?.tax_responsibility || '-'}</p>
        </div>
        <div>
          <span className="text-gray-500">Régimen:</span>
          <p className="font-medium">{company?.regimen || '-'}</p>
        </div>
      </div>
    </div>
  );
}