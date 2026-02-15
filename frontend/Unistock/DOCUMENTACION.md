# Documentación - Componentes Principales

## Tabla de Contenidos
1. [Navbar](#navbar)
2. [Sidebar](#sidebar)
3. [Dashboard](#dashboard)

---

## Navbar

**Archivo:** `src/components/navbar.jsx`

### Descripción General
Barra de navegación superior que muestra el nombre del usuario actual y un menú desplegable con información del perfil y opciones de sesión.

### Estructura

#### Dependencias
```javascript
import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Briefcase, MapPin, LogOut, Edit } from 'lucide-react';
```
- Usa **lucide-react** para iconos
- Gestiona estado con `useState`
- Usa `useRef` para detectar clicks externos
- Usa `useEffect` para limpiar event listeners

### Estados
- **open** (boolean): Controla si el dropdown está abierto

### Datos del Usuario
```javascript
const user = {
  name: 'Sofia Osorio',           // Nombre del usuario
  email: 'sofiaosorio@gmail.com', // Email
  rol: 'Empleado',                // Rol/Puesto
  sede: 'Parque la 93',           // Ubicación de la sede
};
```

### Funcionalidad

#### Click Fuera del Dropdown
- Al hacer click fuera del dropdown, este se cierra automáticamente
- Usa `dropdownRef.current.contains(e.target)` para detectar
- Se limpia el event listener al desmontar el componente

#### Estructura del Dropdown
1. **Encabezado**: Muestra email del usuario
2. **Información del usuario**:
   - Email (con icono Mail)
   - Rol (con icono Briefcase)
   - Sede (con icono MapPin)
3. **Acciones**:
   - "Cerrar sesión" (botón rosa/pink)
   - "Editar perfil" (botón gris)

### Estilos
- **Navbar**: Fondo blanco con borde inferior gris
- **Dropdown**: Fondo blanco, redondeado, con sombra 2xl
- **Botón usuario**: Borde rosa, icon rosa
- **Botones acción**: Rosa para logout, gris para editar

### Componentes Usados
```jsx
<nav>              // Barra de navegación
<button>           // Botón del dropdown
<div>              // Contenedor del dropdown
```

---

## Sidebar

**Archivo:** `src/components/sidebar.jsx`

### Descripción General
Barra lateral con menú principal que permite navegar entre secciones. Incluye un rail vertical con iconos y un panel expandible para submenús.

### Estructura

#### Dependencias
```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '../assets/icons/Dashboard';
import UsuariosIcon from '../assets/icons/Usuarios';
import ComprasIcon from '../assets/icons/Compras';
import ProduccionIcon from '../assets/icons/Produccion';
import logo from '../assets/transparent-Photoroom.png';
```
- Usa iconos importados como componentes
- Usa `useNavigate` para navegación
- Todos los iconos están en `src/assets/icons/`

#### Estructura de Menú
```javascript
const menuItems = [
  { 
    id: 'dashboard', 
    name: 'Dashboard', 
    icon: DashboardIcon, 
    hasSubmenu: false 
  },
  { 
    id: 'usuarios', 
    name: 'Usuarios', 
    icon: UsuariosIcon, 
    hasSubmenu: false 
  },
  { 
    id: 'compras', 
    name: 'Compras', 
    icon: ComprasIcon, 
    hasSubmenu: true,
    submenu: ['Insumos', 'Categorías', 'Proveedores', 'Compras'],
  },
  { 
    id: 'produccion', 
    name: 'Producción', 
    icon: ProduccionIcon, 
    hasSubmenu: true,
    submenu: ['Categorías', 'Producción', 'Productos'],
  },
];
```

### Estados
- **activeMenu** (string|null): ID del menú activo
- **activeSubItem** (string|null): ID del subitem activo
- **hoveredSub** (string|null): ID del subitem en hover

### Funcionalidad

#### Click en Menú
```javascript
const handleMenuClick = (item) => {
  if (!item.hasSubmenu) {
    // Si no tiene submenú, navega directamente
    setActiveMenu(item.id);
    setActiveSubItem(null);
    navigate(`/${item.id}`);
    return;
  }
  // Si tiene submenú, lo abre/cierra
  setActiveMenu(prev => prev === item.id ? null : item.id);
  setActiveSubItem(null);
};
```

#### Panel Lateral
- Se expande/contrae según `isPanelOpen`
- Ancho va de 0 a 160px (w-40)
- Opacidad va de 0 a 100
- Tiene transición suave (300ms)

### Estructura Visual

#### Rail Vertical
- Ancho: 120px (w-30)
- Fondo blanco con borde derecho
- Elementos centrados verticalmente
- Espaciado: 4px entre botones

#### Botones del Menú
- Base: 72px x 72px (w-18 h-18)
- Redondeados: 8px (rounded-2xl)
- Contiene icono (32x32) y nombre (10px)
- Colores:
  - **Activo**: Fondo rosa (#f472b6), texto blanco
  - **Inactivo**: Fondo transparente, texto gris
  - **Hover**: Fondo rosa claro (#fce7f3)

#### Panel Lateral (Submenú)
- Ancho: 160px (w-40)
- Botones de subitem:
  - Padding: 8px 16px
  - Margen: 4px 12px
  - Redondeados: 8px (rounded-lg)
  - Texto: 16px, semibold
  - Colores:
    - **Activo/Hover**: Fondo rosa (#ec4899), texto blanco
    - **Inactivo**: Fondo blanco, texto gris, hover rosa claro

### Flujo de Navegación
1. Usuario clica un menú
2. Si no tiene submenú: navega directamente
3. Si tiene submenú: abre panel lateral
4. Panel muestra opciones disponibles
5. Al elegir subitem: se marca como activo

---

## Dashboard

**Archivo:** `src/feature/dashboard/dashboard.jsx`

### Descripción General
Panel de control principal que muestra gráficas de producción, estadísticas y estado de procesos. Incluye visualización de datos en tiempo real con múltiples vistas (Semana, Mes, Año).

### Estructura

#### Dependencias
```javascript
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, 
         Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
```
- Usa **Recharts** para gráficas
- Librería profesional de visualización de datos

#### Datos Principales

##### dataByView
Contiene datos para 3 vistas temporales:
- **Semana**: 16 registros (lunes a domingo)
- **Mes**: 16 registros por semanas
- **Año**: 12 registros mensuales

Cada registro tiene:
```javascript
{
  label: 'Lun',      // Etiqueta del período
  terceros: 185,     // Producción de terceros
  sede1: 245,        // Producción Sede 1
  sede2: 215         // Producción Sede 2
}
```

##### barData
Datos del gráfico de barra de procesos (11 estados):
```javascript
const barData = [
  { name: 'En espera', value: 50 },
  { name: 'Tráfico entre sedes', value: 25 },
  { name: 'Ficha técnica', value: 15 },
  { name: 'Corte', value: 5 },
  { name: 'Diseño', value: 15 },
  { name: 'En producción', value: 10 },
  { name: 'Bodega', value: 20 },
  { name: 'Mercadeo', value: 13 },
  { name: 'Cancelado', value: 3 },
  { name: 'Compras', value: 10 },
  { name: 'Recepción', value: 2 },
];
```

#### Constantes
```javascript
const MONTHS = ['Enero','Febrero','Marzo',...,'Diciembre']; // 12 meses
const YEARS  = [2022, 2023, 2024, 2025, 2026];              // 5 años
```

### Estados
```javascript
const [viewMode, setViewMode]           = useState('Todas');        // Filtro: Todas, Terceros, Sede 1, Sede 2
const [timeView, setTimeView]           = useState('Mes');          // Período: Semana, Mes, Año
const [selectedMonth, setSelectedMonth] = useState('Enero');        // Mes seleccionado (líneas)
const [selectedYear, setSelectedYear]   = useState(2026);           // Año seleccionado (líneas)
const [selectedBarYear, setSelectedBarYear]       = useState(2026); // Año barra
const [selectedBarMonth, setSelectedBarMonth]     = useState('Enero'); // Mes barra
const [barTimeView, setBarTimeView]     = useState('Año');          // Período barra
```

### Componentes Secundarios

#### Card
Envoltorio reutilizable para las tarjetas:
```jsx
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl p-5 ${className}`} 
       style={{border: "1.5px solid #e5e7eb"}}>
    {children}
  </div>
);
```
- Fondo blanco
- Bordes redondeados (8px)
- Padding: 20px
- Borde: 1.5px gris claro

#### Dropdown
Selector personalizado:
- Abre/cierra al hacer click
- Muestra opciones en lista desplegable
- Marca opción seleccionada en color fuchsia
- Genera opciones dinámicamente desde prop `options`

#### BarTick
Componente personalizado para ejes X de barra:
- Divide etiquetas en múltiples líneas (split por espacio)
- Cada palabra en línea nueva
- Espaciado: 13px entre líneas

### Secciones del Dashboard

#### 1. Encabezado (Fila 2: stats)
4 tarjetas de estadísticas:
```
┌─────────────────────────────────────────────┐
│  Producciones   │ Completadas │  Por iniciar │  Promedio
│  actuales: 10   │ este mes: 8 │ este mes: 2  │ tiempo: 4 días
└─────────────────────────────────────────────┘
```
Cada una con:
- Icono (6x6px)
- Etiqueta (xs, gris)
- Valor (3xl, negrita)

#### 2. Gráfica de Líneas
Muestra producción por sedes en tiempo:
- **Eje Y**: Órdenes de producción (0-330)
- **Eje X**: Períodos (días, semanas, meses)
- **Colores**:
  - Terceros: Verde (#22c55e) - 2px
  - Sede 1: Púrpura (#e040b8) - 2px
  - Sede 2: Rosa claro (#f0a0d8) - 1.5px
- **Grid**: Rayado rosa suave (#F5D8F5)
- **Filtros**:
  - Vista: Semana/Mes/Año
  - Sedes: Filtrar por sede
  - Dropdowns: Seleccionar mes/año según período

#### 3. Panel Derecho (Dos tarjetas)

**Tarjeta 1: Estado General**
- Gráfico de barras simple
- Producciones con retraso (2) - rosa
- Todo en orden (45) - verde

**Tarjeta 2: Insumos**
- "Por adquisición": 120 unidades (icono bolsa)
- "En bodega": 450 unidades (icono almacén)

### Flujo de Interacción

#### Cambio de Vista (Línea)
```
Usuario selecciona filtro
  ↓
setViewMode actualiza
  ↓
Calcular showTerceros, showSede1, showSede2
  ↓
LineChart filtra líneas visibles
```

#### Cambio de Período (Línea)
```
Usuario selecciona Semana/Mes/Año
  ↓
setTimeView actualiza
  ↓
Mostrar/ocultar dropdowns relevantes
  ↓
LineChart cambia datos a dataByView[timeView]
```

### Paleta de Colores
```
Primarios:
- Fuchsia/Púrpura: #e040b8 (Sede 1, botones activos)
- Rosa: #f472b6, #ec4899, #f0a0d8 (Sede 2, variantes)
- Verde: #22c55e (Terceros)

Neutrales:
- Blanco: #ffffff (fondos)
- Gris claro: #e5e7eb (bordes)
- Gris oscuro: #111827 (texto)
- Gris medio: #4b5563 (ejes)

Fondos:
- Fuchsia claro: #fce7f3 (hover)
- Rosa claro: #fdf6fc (fondo page)
```

### Responsive
- Usa Tailwind CSS grid system
- Gap: 16px entre secciones
- Padding: 20px general
- LineChart adaptable con `ResponsiveContainer`

### Notas Importantes
1. **Datos simulados**: Todos los valores son mock data para demostración
2. **Período flexible**: Soporta 3 vistas temporales diferentes
3. **Filtros anidados**: Permite combinar filtros de sede y período
4. **Gráfica profesional**: Usa Recharts, librería estándar en React
5. **Sin API**: Actualmente usa datos locales (dataByView y barData)

---

## Resumen de Integración

### Estructura de Navegación
```
App
├── Navbar (arriba)
├── Sidebar (izquierda)
│   ├── Rail (iconos)
│   └── Panel (submenús)
└── Contenido
    ├── Dashboard (principal)
    ├── Usuarios
    ├── Compras
    │   ├── Insumos
    │   ├── Categorías
    │   ├── Proveedores
    │   └── Compras
    └── Producción
        ├── Categorías
        ├── Producción
        └── Productos
```

### Flujo de Usuario
1. **Inicia sesión** → Ve Navbar con su nombre
2. **Navega** → Usa Sidebar para cambiar de sección
3. **Visualiza datos** → Ve Dashboard con gráficas y estadísticas
4. **Perfil** → Click en usuario en Navbar → Dropdown
5. **Submódulos** → Click en menú con submenú → Panel se expande

---

## Stack Tecnológico
- **React 18** - Framework
- **React Router** - Navegación
- **Tailwind CSS** - Estilos
- **Recharts** - Gráficas
- **Lucide React** - Iconos
- **Vite** - Build tool