export default function CompanyPreview({ company }) {
  return (
    <div className="border-2 border-gray-300 rounded-xl p-6 bg-white shadow-sm">
      {/* Header simulado de factura */}
      <div className="flex items-start gap-4 pb-4 border-b-2 border-gray-200">
        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 font-bold text-xs shrink-0">
          LOGO
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-gray-900 leading-tight">
            {company?.name || 'Nombre de la Empresa'}
          </p>
          <p className="text-sm text-gray-500">
            NIT: {company?.nit || '000.000.000-0'}
          </p>
          <p className="text-xs text-gray-400">
            {company?.phone ? `Tel: ${company.phone}` : ''}
          </p>
        </div>
      </div>

      {/* Cuerpo simulado */}
      <div className="py-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Dirección:</span>
          <span className="text-gray-800 font-medium text-right max-w-[60%]">
            {company?.address || '—'}
            {company?.municipality ? `, ${company.municipality}` : ''}
          </span>
        </div>
        <div className="border-t border-dashed border-gray-200" />
        <div className="text-center text-xs text-gray-400 italic">
          Vista previa del encabezado de factura
        </div>
      </div>

      {/* Footer simulado */}
      <div className="pt-3 border-t-2 border-gray-200 text-center">
        <p className="text-[10px] text-gray-400">
          {company?.email ? `Email: ${company.email}` : ''}
          {company?.email && company?.phone ? ' | ' : ''}
          {company?.phone ? `Tel: ${company.phone}` : ''}
        </p>
      </div>
    </div>
  );
}
