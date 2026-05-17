import dayjs from 'dayjs';

export default function InvoiceHeader({ company, invoiceNumber, issueDate }) {
  return (
    <div className="invoice-header flex justify-between items-start">
      {/* Left - Logo and Company Name */}
      <div className="flex items-center gap-4">
        <img
          src="/logo.jpeg"
          alt="Logo"
          className="h-20 w-auto rounded-lg border-2 border-white"
        />
        <div>
          <h2 className="text-xl font-bold">{company?.name || 'Nombre de la Empresa'}</h2>
          <p className="text-sm text-gray-300">Sistema de Facturación Electrónica</p>
        </div>
      </div>

      {/* Right - Invoice Title */}
      <div className="text-right">
        <h1 className="text-2xl font-bold text-white">FACTURA ELECTRÓNICA DE VENTA</h1>
        <div className="mt-2 space-y-1 text-sm">
          <p className="text-gray-300">
            <span className="font-semibold">No. </span>
            <span className="font-mono text-lg">{invoiceNumber}</span>
          </p>
          <p className="text-gray-300">
            <span className="font-semibold">Fecha: </span>
            {issueDate}
          </p>
          <p className="text-gray-300">
            <span className="font-semibold">Validación: </span>
            {dayjs().format('DD/MM/YYYY HH:mm:ss')}
          </p>
        </div>

        {/* Resolution Info */}
        <div className="mt-3 pt-3 border-t border-gray-600 text-xs text-gray-400">
          <p>Resolución DIAN: {company?.resolution_number || 'N/A'}</p>
          <p>Régimen: {company?.regimen || 'Común'}</p>
          <p>Software ID: {company?.software_id || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}