document.addEventListener('DOMContentLoaded', () => {
    const empresaInput = document.getElementById('empresa');
    const clienteInput = document.getElementById('cliente');
    const duiInput = document.getElementById('dui');
    const tipoProductoSelect = document.getElementById('tipoProducto');
    const cantidadInput = document.getElementById('cantidad');
    const pesoInput = document.getElementById('peso');
    const valorUnitarioInput = document.getElementById('valorUnitario');
    const btnAgregar = document.getElementById('btnAgregar');
    const btnDescargarPNG = document.getElementById('btnDescargarPNG');
    const btnDescargarPDF = document.getElementById('btnDescargarPDF');
    const listaProductos = document.getElementById('listaProductos');
    const sinProductos = document.getElementById('sinProductos');
    const subtotalDisplay = document.getElementById('subtotal');
    const totalDisplay = document.getElementById('total');

    const previewEmpresa = document.getElementById('previewEmpresa');
    const previewNumero = document.getElementById('previewNumero');
    const previewFecha = document.getElementById('previewFecha');
    const previewCliente = document.getElementById('previewCliente');
    const previewDui = document.getElementById('previewDui');
    const previewProductos = document.getElementById('previewProductos');
    const previewSubtotal = document.getElementById('previewSubtotal');
    const previewTotal = document.getElementById('previewTotal');
    const vistaPrevia = document.getElementById('vistaPrevia');

    let productos = [];
    let numeroFactura = generarNumeroFactura();

    inicializarVistaPrevia();

    empresaInput.addEventListener('input', actualizarVistaPrevia);
    clienteInput.addEventListener('input', actualizarVistaPrevia);
    duiInput.addEventListener('input', actualizarVistaPrevia);

    btnAgregar.addEventListener('click', agregarProducto);
    btnDescargarPNG.addEventListener('click', descargarFacturaPNG);
    btnDescargarPDF.addEventListener('click', descargarFacturaPDF);

    cantidadInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') agregarProducto();
    });
    valorUnitarioInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') agregarProducto();
    });

    function generarNumeroFactura() {
        return Math.floor(Math.random() * 90000) + 10000;
    }

    function obtenerFechaActual() {
        const fecha = new Date();
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const año = fecha.getFullYear();
        return `${dia}/${mes}/${año}`;
    }

    function formatoMoneda(valor) {
        return `$${parseFloat(valor).toFixed(2)}`;
    }

    function inicializarVistaPrevia() {
        previewNumero.textContent = `#${numeroFactura}`;
        previewFecha.textContent = obtenerFechaActual();
    }

    function actualizarVistaPrevia() {
        previewEmpresa.textContent = empresaInput.value || 'Nombre de la Empresa';
        previewCliente.textContent = clienteInput.value || '-';
        previewDui.textContent = duiInput.value || '-';

        renderizarProductosPreview();
        calcularTotales();
    }

    function renderizarProductosPreview() {
        previewProductos.innerHTML = '';

        if (productos.length === 0) {
            previewProductos.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-gray-400">Sin productos</td></tr>';
            return;
        }

        productos.forEach(producto => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td class="px-2 py-2 text-sm text-gray-700 border-b">${producto.tipo}</td>
                <td class="px-2 py-2 text-sm text-gray-700 border-b text-right">${producto.cantidad}</td>
                <td class="px-2 py-2 text-sm text-gray-700 border-b text-right">${formatoMoneda(producto.valorUnitario)}</td>
                <td class="px-2 py-2 text-sm text-gray-700 border-b text-right font-medium">${formatoMoneda(producto.total)}</td>
            `;
            previewProductos.appendChild(fila);
        });
    }

    function agregarProducto() {
        const tipo = tipoProductoSelect.value;
        const cantidad = parseInt(cantidadInput.value) || 0;
        const peso = parseFloat(pesoInput.value) || 0;
        const valorUnitario = parseFloat(valorUnitarioInput.value) || 0;

        if (!tipo) {
            alert('Por favor selecciona un tipo de producto');
            tipoProductoSelect.focus();
            return;
        }
        if (cantidad <= 0) {
            alert('Por favor ingresa una cantidad válida');
            cantidadInput.focus();
            return;
        }
        if (valorUnitario <= 0) {
            alert('Por favor ingresa un valor unitario válido');
            valorUnitarioInput.focus();
            return;
        }

        const total = cantidad * valorUnitario;

        productos.push({
            tipo,
            cantidad,
            peso,
            valorUnitario,
            total
        });

        renderizarTabla();
        actualizarVistaPrevia();
        limpiarFormulario();
    }

    function renderizarTabla() {
        if (productos.length === 0) {
            listaProductos.innerHTML = `
                <tr id="sinProductos" class="text-center">
                    <td colspan="5" class="px-4 py-8 text-gray-400">No hay productos añadidos</td>
                </tr>
            `;
            return;
        }

        listaProductos.innerHTML = '';

        productos.forEach((producto, index) => {
            const fila = document.createElement('tr');
            fila.className = 'border-b hover:bg-gray-50 transition';
            fila.innerHTML = `
                <td class="px-4 py-3 text-gray-700">${producto.tipo}</td>
                <td class="px-4 py-3 text-right text-gray-700">${producto.cantidad}</td>
                <td class="px-4 py-3 text-right text-gray-700">${formatoMoneda(producto.valorUnitario)}</td>
                <td class="px-4 py-3 text-right font-medium text-gray-800">${formatoMoneda(producto.total)}</td>
                <td class="px-4 py-3 text-right">
                    <button onclick="eliminarProducto(${index})" class="text-red-500 hover:text-red-700 p-1 rounded transition" title="Eliminar">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M7 7h10" />
                        </svg>
                    </button>
                </td>
            `;
            listaProductos.appendChild(fila);
        });
    }

    function calcularTotales() {
        const subtotal = productos.reduce((sum, p) => sum + p.total, 0);

        subtotalDisplay.textContent = formatoMoneda(subtotal);
        totalDisplay.textContent = formatoMoneda(subtotal);

        previewSubtotal.textContent = formatoMoneda(subtotal);
        previewTotal.textContent = formatoMoneda(subtotal);
    }

    window.eliminarProducto = function(index) {
        productos.splice(index, 1);
        renderizarTabla();
        actualizarVistaPrevia();
    };

    function limpiarFormulario() {
        tipoProductoSelect.value = '';
        cantidadInput.value = '1';
        pesoInput.value = '';
        valorUnitarioInput.value = '';
        tipoProductoSelect.focus();
    }

    async function descargarFacturaPNG() {
        if (productos.length === 0) {
            alert('Agrega al menos un producto antes de descargar la factura');
            return;
        }

        const btnOriginalText = btnDescargarPNG.innerHTML;
        btnDescargarPNG.classList.add('btn-loading');
        btnDescargarPNG.innerHTML = 'Generando...';

        try {
            const canvas = await html2canvas(vistaPrevia, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                width: vistaPrevia.offsetWidth,
                height: vistaPrevia.offsetHeight
            });

            const link = document.createElement('a');
            link.download = `factura-${numeroFactura}-${obtenerFechaActual().replace(/\//g, '')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

        } catch (error) {
            console.error('Error al generar la factura:', error);
            alert('Error al generar la factura. Por favor intenta de nuevo.');
        } finally {
            btnDescargarPNG.classList.remove('btn-loading');
            btnDescargarPNG.innerHTML = btnOriginalText;
        }
    }

    async function descargarFacturaPDF() {
        if (productos.length === 0) {
            alert('Agrega al menos un producto antes de descargar la factura');
            return;
        }

        const btnOriginalText = btnDescargarPDF.innerHTML;
        btnDescargarPDF.classList.add('btn-loading');
        btnDescargarPDF.innerHTML = 'Generando...';

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            const empresa = empresaInput.value || 'Nombre de la Empresa';
            const cliente = clienteInput.value || '-';
            const dui = duiInput.value || '-';
            const fecha = obtenerFechaActual();
            const subtotal = productos.reduce((sum, p) => sum + p.total, 0);

            let y = 20;

            doc.setFontSize(20);
            doc.setTextColor(139, 92, 246);
            doc.text(empresa, 105, y, { align: 'center' });
            y += 10;

            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text(`Factura #: #${numeroFactura}`, 105, y, { align: 'center' });
            y += 6;
            doc.text(`Fecha: ${fecha}`, 105, y, { align: 'center' });
            y += 12;

            doc.setDrawColor(229, 231, 235);
            doc.line(20, y, 190, y);
            y += 10;

            doc.setFontSize(11);
            doc.setTextColor(75, 85, 99);
            doc.text(`Cliente: ${cliente}`, 20, y);
            y += 6;
            doc.text(`DUI: ${dui}`, 20, y);
            y += 12;

            doc.line(20, y - 6, 190, y - 6);
            doc.setFillColor(245, 243, 255);
            doc.rect(20, y, 170, 8, 'F');
            doc.setFontSize(10);
            doc.setTextColor(107, 114, 128);
            doc.text('Producto', 22, y + 5);
            doc.text('Cant.', 110, y + 5, { align: 'center' });
            doc.text('V. Unit.', 140, y + 5, { align: 'center' });
            doc.text('Total', 175, y + 5, { align: 'right' });
            y += 12;

            doc.setTextColor(55, 65, 81);
            productos.forEach(producto => {
                doc.text(producto.tipo, 22, y);
                doc.text(producto.cantidad.toString(), 110, y, { align: 'center' });
                doc.text(formatoMoneda(producto.valorUnitario), 140, y, { align: 'center' });
                doc.text(formatoMoneda(producto.total), 175, y, { align: 'right' });
                y += 8;
            });

            y += 6;
            doc.line(20, y, 190, y);
            y += 12;

            doc.setFontSize(12);
            doc.setTextColor(75, 85, 99);
            doc.text('Subtotal:', 140, y);
            doc.text(formatoMoneda(subtotal), 175, y, { align: 'right' });
            y += 8;

            doc.setFontSize(14);
            doc.setTextColor(139, 92, 246);
            doc.text('Total:', 140, y);
            doc.text(formatoMoneda(subtotal), 175, y, { align: 'right' });

            const nombreArchivo = `factura-${numeroFactura}-${fecha.replace(/\//g, '')}.pdf`;
            doc.save(nombreArchivo);

        } catch (error) {
            console.error('Error al generar el PDF:', error);
            alert('Error al generar el PDF. Por favor intenta de nuevo.');
        } finally {
            btnDescargarPDF.classList.remove('btn-loading');
            btnDescargarPDF.innerHTML = btnOriginalText;
        }
    }

    window.eliminarProducto = eliminarProducto;
});