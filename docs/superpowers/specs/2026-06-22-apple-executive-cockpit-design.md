# Apple Executive Cockpit Design

## Objetivo

Redisenar Startup OS Personal como una herramienta ejecutiva premium para uso diario de German: clara, compacta, rapida de escanear y lista para conectarse a Google Sheets, Drive y Docs sin parecer una plantilla administrativa.

## Concepto Aprobado

Referencia visual aceptada:

`docs/design/apple-executive-cockpit-concept.png`

La direccion es Apple-like sin copiar marcas: fondo blanco y gris frio, tipografia tipo sistema, topbar translucida, sidebar sobria, paneles con hairline borders, radio discreto, iconos lineales y color semantico muy medido.

## Experiencia

La pantalla principal debe abrir como centro de comando de "Hoy":

- Encabezado con fecha, estado del dia y resumen ejecutivo.
- KPIs compactos para tareas criticas, proyectos activos, funnel abierto, facturas vencidas e ingresos del mes.
- Paneles operativos para prioridades, proyectos activos, agenda, funnel, facturas, siguientes acciones y actividad reciente.
- Accesos rapidos visibles sin ocupar el foco principal.
- Estado de Google claro: conectado/no conectado, sin exponer detalles tecnicos innecesarios.

Las pantallas de modulo aun sin CRUD real deben sentirse terminadas: header ejecutivo, tabs/subvistas, tabla/lista semilla, estados y acciones coherentes con el modulo.

## Sistema Visual

- Paleta: blanco real, gris frio suave, texto negro azulado, acento azul principal, verde/ambar/rojo solo para estados.
- Tipografia: Inter/system, sin letter-spacing negativo, jerarquia compacta y legible.
- Contenedores: paneles de radio 8px, hairline borders, sombras casi imperceptibles.
- Botones: icono + label para acciones principales; icon-only solo cuando el significado sea obvio.
- Navegacion: sidebar fija desktop, compacta en tablet, nav superior horizontal en mobile.
- Movimiento: transiciones cortas para hover/focus/modal; respetar `prefers-reduced-motion`.

## Componentes

- `AppLayout`: shell principal con sidebar, topbar, main y modal.
- `Sidebar`: brand, navegacion, tarjeta de conexion Google y usuario.
- `Topbar`: command search, estado Google, acciones de conexion/inicializacion/crear.
- `DashboardPage`: composicion del cockpit con datos semilla.
- `PlaceholderPage`: experiencia premium para modulos pendientes.
- `SettingsPage`: diagnostico Google y setup con estados visuales.
- `QuickCreateModal`: modal refinado con acciones por tipo de objeto.
- UI primitives: `Badge`, `MetricCard` y nuevos estilos compartidos.

## Responsivo

- Desktop: sidebar fija de 270px, dashboard en grid 12 columnas.
- Tablet: sidebar reducida a iconos, dashboard en 2 columnas.
- Mobile: sidebar se vuelve nav superior compacta, topbar apilada, paneles en una columna, botones sin overflow.

## Testing Y Verificacion

- Tests de render para labels clave del cockpit y modal.
- `npm run test`
- `npm run typecheck`
- `npm run build`
- Verificacion visual en navegador con desktop y mobile.
- Comparacion manual contra `docs/design/apple-executive-cockpit-concept.png`.
