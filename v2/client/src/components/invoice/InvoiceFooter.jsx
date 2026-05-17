export default function InvoiceFooter({ totalLetters, notes, terms, company, invoiceNumber }) {
  return (
    <div className="bg-gray-100 p-4 text-sm">
      {/* Valor en letras */}
      <div className="mb-4 p-3 bg-white rounded border">
        <p className="text-xs text-gray-500 uppercase mb-1">Valor en Letras</p>
        <p className="font-medium">{totalLetters || 'CERO PESOS 00/100'}</p>
      </div>

      {/* Notas y Términos */}
      {(notes || terms) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {notes && (
            <div className="p-3 bg-white rounded border">
              <p className="text-xs text-gray-500 uppercase mb-1">Notas</p>
              <p className="text-gray-700">{notes}</p>
            </div>
          )}
          {terms && (
            <div className="p-3 bg-white rounded border">
              <p className="text-xs text-gray-500 uppercase mb-1">Términos y Condiciones</p>
              <p className="text-gray-700">{terms}</p>
            </div>
          )}
        </div>
      )}

      {/* Technical Info */}
      <div className="border-t pt-3 mt-3">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div>
            <p>Factura generada por sistema MATE Facturas</p>
            <p>Software ID: {company?.software_id || 'N/A'}</p>
            <p>PIN Técnico: {company?.technical_pin || 'N/A'}</p>
          </div>
          <div className="text-right">
            <p>Resolución: {company?.resolution_number || 'N/A'}</p>
            <p>Prefijo: {company?.resolution_prefix || 'FE'}</p>
            <p>CUFE: {invoiceNumber}-{Date.now().toString(36).toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Footer Message */}
      <div className="text-center mt-4 pt-3 border-t">
        <p className="text-xs text-gray-400">
          Esta factura es un documento electrónico de venta según normativa DIAN.
          El uso indebido constituye infracción administrativa y/o penal.
        </p>
      </div>
    </div>
  );
}