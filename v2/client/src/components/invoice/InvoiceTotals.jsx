import { invoiceService } from '../../services/invoiceService';

export default function InvoiceTotals({ totals }) {
  return (
    <div className="flex justify-end p-4 bg-gray-50">
      <div className="w-full md:w-72">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b">
              <td className="py-2 text-gray-600">Subtotal:</td>
              <td className="py-2 text-right font-medium">{invoiceService.formatCurrency(totals.subtotal)}</td>
            </tr>
            {totals.totalDiscount > 0 && (
              <tr className="border-b">
                <td className="py-2 text-gray-600">Descuentos:</td>
                <td className="py-2 text-right text-red-600">-{invoiceService.formatCurrency(totals.totalDiscount)}</td>
              </tr>
            )}
            <tr className="border-b">
              <td className="py-2 text-gray-600">Base IVA:</td>
              <td className="py-2 text-right">{invoiceService.formatCurrency(totals.baseIva)}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 text-gray-600">IVA (19%):</td>
              <td className="py-2 text-right">{invoiceService.formatCurrency(totals.ivaAmount)}</td>
            </tr>
            <tr className="border-t-2 border-gray-800">
              <td className="py-3 text-lg font-bold text-gray-800">Total a Pagar:</td>
              <td className="py-3 text-lg font-bold text-right text-gray-800">
                {invoiceService.formatCurrency(totals.total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}