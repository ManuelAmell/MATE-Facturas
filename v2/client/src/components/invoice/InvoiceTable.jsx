import { invoiceService } from '../../services/invoiceService';

export default function InvoiceTable({ items }) {
  return (
    <div className="p-4">
      <table className="invoice-table">
        <thead>
          <tr>
            <th className="w-12">#</th>
            <th className="w-20">Código</th>
            <th>Descripción</th>
            <th className="w-16 text-center">Cant.</th>
            <th className="w-16 text-center">Unidad</th>
            <th className="w-24 text-right">P. Unitario</th>
            <th className="w-20 text-right">IVA {`(%)`}</th>
            <th className="w-24 text-right">Subtotal</th>
            <th className="w-24 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id || index}>
              <td className="text-center text-gray-400">{index + 1}</td>
              <td className="font-mono text-xs">{item.code || '-'}</td>
              <td>{item.description}</td>
              <td className="text-center">{item.quantity}</td>
              <td className="text-center">{item.unit || 'UND'}</td>
              <td className="text-right">{invoiceService.formatCurrency(item.unit_price)}</td>
              <td className="text-right">{item.iva_rate}%</td>
              <td className="text-right">{invoiceService.formatCurrency(item.subtotal)}</td>
              <td className="text-right font-medium">{invoiceService.formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {items.length === 0 && (
        <p className="text-center text-gray-400 py-8">No hay productos en la factura</p>
      )}
    </div>
  );
}