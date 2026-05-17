import { useState, useEffect } from 'react';

export default function InvoiceQR({ invoiceNumber, companyName, companyNit, total }) {
  const [qrImage, setQrImage] = useState(null);

  useEffect(() => {
    generateQR();
  }, [invoiceNumber, companyName, companyNit, total]);

  const generateQR = async () => {
    try {
      const QRCode = (await import('qrcode')).default;
      const qrData = JSON.stringify({
        uuid: `INV-${invoiceNumber}`,
        numero: invoiceNumber,
        empresa: companyName,
        nit: companyNit,
        total: total.toFixed(2),
        fecha: new Date().toISOString().split('T')[0],
        url: 'https://catalogo-vpfe.dian.gov.co/document/search'
      });

      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 120,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrImage(dataUrl);
    } catch (error) {
      console.error('Error generating QR:', error);
    }
  };

  return (
    <div className="flex justify-between items-start p-4 border-t bg-gray-50">
      {/* QR Code */}
      <div className="flex items-center gap-4">
        {qrImage ? (
          <img src={qrImage} alt="QR Code" className="border-2 border-gray-800 rounded" />
        ) : (
          <div className="w-[120px] h-[120px] bg-gray-200 border-2 border-gray-800 flex items-center justify-center">
            <span className="text-xs text-gray-500">Cargando QR...</span>
          </div>
        )}
        <div className="text-xs text-gray-600">
          <p className="font-bold">Código QR de Validación</p>
          <p>Escanee para verificar autenticidad</p>
        </div>
      </div>

      {/* Payment Reference Image */}
      <div className="text-center">
        <p className="text-xs text-gray-500 mb-2">Métodos de Pago</p>
        <img
          src="/imgpago.jpeg"
          alt="Pago"
          className="h-40 w-auto object-contain"
        />
      </div>
    </div>
  );
}