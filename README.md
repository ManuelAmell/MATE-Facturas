# MateFacturas - Generador de Facturas

## Descripción

Aplicación web para generar facturas electrónicas con vista previa en tiempo real. Permite añadir productos, calcular totales y exportar a formatos PNG y PDF.

## Estructura del Proyecto

```
MateFacturas/
├── index.html      # Estructura HTML y UI de la aplicación
├── app.js         # Lógica JavaScript (gestión de productos, cálculos, exportación)
├── styles.css     # Estilos personalizados
└── README.md      # Documentación del proyecto
```

## Características

- **Datos de Factura**: Empresa, cliente, DUI
- **Gestión de Productos**: Añadir productos con tipo, cantidad, peso y valor unitario
- **Vista Previa**: Actualización en tiempo real
- **Cálculos**: Subtotal y total automático
- **Exportación**: Descargar como PNG o PDF
- **Diseño Responsivo**: Mobile-first con Tailwind CSS

## Tecnologías

- HTML5
- Tailwind CSS (CDN)
- JavaScript (Vanilla)
- html2canvas (captura de pantalla)
- jsPDF (generación de PDF)