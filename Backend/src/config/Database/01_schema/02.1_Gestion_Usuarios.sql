CREATE DATABASE IF NOT EXISTS Unistock_01;

USE Unistock_01;

-- =========================
-- TABLAS BASE
-- =========================

CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255),
    estado BIT DEFAULT b'1'
);

CREATE TABLE privilegios (
    id_privilegio INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL,
    estado BIT DEFAULT b'1'
);

CREATE TABLE modulos (
    id_modulo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    estado BIT DEFAULT b'1'
);

CREATE TABLE sedes (
    id_sede INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    ciudad VARCHAR(50) NOT NULL,
    barrio VARCHAR(100) NOT NULL,
    direccion VARCHAR(150) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    estado BIT DEFAULT b'1'
);

CREATE TABLE estados_produccion (
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    nombre_estado VARCHAR(50),
    orden INT
);

CREATE TABLE categoria_insumo (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE medidas (
    id_medida INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE propiedad (
    id_propiedad INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- =========================
-- USUARIOS Y PERMISOS
-- =========================

CREATE TABLE usuarios (
    id_usuarios INT AUTO_INCREMENT PRIMARY KEY,
    tipo_documento VARCHAR(50) NOT NULL,
    documento BIGINT NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    id_rol INT NOT NULL,
    id_sede INT NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol),
    FOREIGN KEY (id_sede) REFERENCES sedes(id_sede)
);

CREATE TABLE permisos (
    id_permiso INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    id_modulo INT NOT NULL,
    id_privilegio INT NOT NULL,
    estado BIT DEFAULT b'1',
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol),
    FOREIGN KEY (id_modulo) REFERENCES modulos(id_modulo),
    FOREIGN KEY (id_privilegio) REFERENCES privilegios(id_privilegio)
);

-- =========================
-- PROVEEDORES
-- =========================

CREATE TABLE proveedores (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    nit BIGINT,
    nombre_empresa VARCHAR(100),
    nombre_contacto VARCHAR(60),
    direccion VARCHAR(60),
    telefono VARCHAR(20),
    correo VARCHAR(100),
    sitio_web VARCHAR(150),
    activo BIT DEFAULT b'1'
);

-- =========================
-- INSUMOS
-- =========================

CREATE TABLE insumos (
    id_insumo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    id_categoria INT NOT NULL,
    stock INT NOT NULL,
    valor_medida DECIMAL(10,2) NOT NULL,
    id_medida INT NOT NULL,
    imagen VARCHAR(255),
    estado BIT DEFAULT b'1',
    FOREIGN KEY (id_categoria) REFERENCES categoria_insumo(id_categoria),
    FOREIGN KEY (id_medida) REFERENCES medidas(id_medida)
);

CREATE TABLE insumo_propiedad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_insumo INT NOT NULL,
    id_propiedad INT NOT NULL,
    valor VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_insumo) REFERENCES insumos(id_insumo),
    FOREIGN KEY (id_propiedad) REFERENCES propiedad(id_propiedad)
);

-- =========================
-- PRODUCTOS
-- =========================

CREATE TABLE categoria_producto (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(250),
    cantidad_producto INT NOT NULL,
    productos_disponibles INT NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE producto (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    imagenes_url VARCHAR(200),
    referencia VARCHAR(20) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    precio INT NOT NULL,
    stock INT NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (id_categoria) REFERENCES categoria_producto(id_categoria)
);

-- =========================
-- FICHA TECNICA
-- =========================

CREATE TABLE ficha_tecnica (
    id_ficha_tecnica INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    responsable VARCHAR(50),
    fecha_inicio DATE,
    fecha_fin DATE,
    versiones VARCHAR(10),
    descripciones TEXT,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

CREATE TABLE material_ficha_tecnica (
    id_material INT AUTO_INCREMENT PRIMARY KEY,
    id_insumo INT NOT NULL,
    id_ficha_tecnica INT NOT NULL,
    cantidad INT NOT NULL,
    id_medida INT NOT NULL,
    FOREIGN KEY (id_insumo) REFERENCES insumos(id_insumo),
    FOREIGN KEY (id_ficha_tecnica) REFERENCES ficha_tecnica(id_ficha_tecnica),
    FOREIGN KEY (id_medida) REFERENCES medidas(id_medida)
);

-- =========================
-- ORDENES DE PRODUCCION
-- =========================

CREATE TABLE orden_produccion (
    id_orden INT AUTO_INCREMENT PRIMARY KEY,
    fecha_creacion DATETIME,
    fecha_entrega DATETIME,
    cliente VARCHAR(100),
    id_usuarios INT,
    FOREIGN KEY (id_usuarios) REFERENCES usuarios(id_usuarios)
);

CREATE TABLE orden_detalle (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_orden INT,
    id_producto INT,
    cantidad INT,
    color VARCHAR(30),
    estado BIT,
    FOREIGN KEY (id_orden) REFERENCES orden_produccion(id_orden),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

CREATE TABLE procesos_orden_produccion (
    id_proceso INT AUTO_INCREMENT PRIMARY KEY,
    id_detalle INT,
    id_estado INT,
    fecha DATETIME,
    id_usuarios INT,
    FOREIGN KEY (id_usuarios) REFERENCES usuarios(id_usuarios),
    FOREIGN KEY (id_detalle) REFERENCES orden_detalle(id_detalle),
    FOREIGN KEY (id_estado) REFERENCES estados_produccion(id_estado)
);

CREATE TABLE historial_cambios (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_orden INT,
    id_estado INT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_usuarios INT,
    FOREIGN KEY (id_orden) REFERENCES orden_produccion(id_orden),
    FOREIGN KEY (id_estado) REFERENCES estados_produccion(id_estado),
    FOREIGN KEY (id_usuarios) REFERENCES usuarios(id_usuarios)
);

-- =========================
-- COMPRAS
-- =========================

CREATE TABLE compras (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    id_proveedor INT NOT NULL,
    observaciones VARCHAR(255),
    costo_total INT NOT NULL,
    estado BIT DEFAULT b'1',
    FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor)
);

CREATE TABLE detalle_compras (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL,
    id_insumo INT NOT NULL,
    medida VARCHAR(50),
    costo INT NOT NULL,
    cantidad INT NOT NULL,
    costo_unitario INT NOT NULL,
    subtotal INT NOT NULL,
    FOREIGN KEY (id_compra) REFERENCES compras(id_compra),
    FOREIGN KEY (id_insumo) REFERENCES insumos(id_insumo)
);
-- =========================
-- Terceros
-- =========================
CREATE TABLE tercero (
    id_tercero INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    contacto VARCHAR(100),
    barrio VARCHAR(100),
    direccion VARCHAR(100),
    telefono VARCHAR(20),
    estado BIT DEFAULT b'1'
);
CREATE TABLE asignacion_terceros (
    id_asignacion INT AUTO_INCREMENT PRIMARY KEY,
    id_orden INT,
    id_tercero INT,
    cantidad INT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_orden) REFERENCES orden_produccion(id_orden),
    FOREIGN KEY (id_tercero) REFERENCES tercero(id_tercero)
);
