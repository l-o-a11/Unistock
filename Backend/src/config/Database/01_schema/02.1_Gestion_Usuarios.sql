CREATE DATABASE IF NOT EXISTS Unistock_01;
USE Unistock_01;

CREATE TABLE Usuarios (
    id_Usuarios INT AUTO_INCREMENT PRIMARY KEY,
    Tipo_de_documento VARCHAR(50) NOT NULL,
    Documento BIGINT NOT NULL UNIQUE,
    Nombre VARCHAR(50) NOT NULL,
    id_Rol INT NOT NULL,
    id_Sede INT NOT NULL,
    Contrasena VARCHAR(255) NOT NULL,
    Estado BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE Proveedor (
    id_Proveedores INT AUTO_INCREMENT PRIMARY KEY,
    Nit INT,
    Nombre_de_la_empresa VARCHAR(50),
    Nombre_de_contacto varchar(60),
    Direccion varchar(60),
    Telefono int,
    Correo varchar(100),
    Sitio_web varchar(150),
    Activo bit
);
CREATE TABLE Categoría (
    id_Categoría INT AUTO_INCREMENT PRIMARY KEY,   
    Nombre VARCHAR(50) NOT NULL,
    Descripción VARCHAR(250),
    Cantidad_Producto INT NOT NULL,
    Productos_Disponibles INT NOT NULL,
    Estado BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE Producto (
    id_Producto INT AUTO_INCREMENT PRIMARY KEY,
    id_Categoría INT NOT NULL, 
    Imagenes_URL VARCHAR(200),  
    Referencia VARCHAR(10) NOT NULL,
    Nombre VARCHAR(50) NOT NULL
    Precio INT NOT NULL,
    Stock INT NOT NULL,
    Estado BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (id_Categoría) REFERENCES Categoría(id_Categoría)
);

CREATE TABLE Ficha_Técnica (
    id_Ficha_Técnica INT AUTO_INCREMENT PRIMARY KEY,
    id_Producto INT NOT NULL,
    Responsable VARCHAR(50),  
    Fecha_Inicio DATE,
    Fecha_Fin DATE,   
    Versiones VARCHAR(10),
    Descripciones TEXT,
    FOREIGN KEY (id_Producto) REFERENCES Producto(id_Producto)
);

CREATE TABLE Material_Ficha_Técnica (
    id_Material_Ficha_Técnica INT AUTO_INCREMENT PRIMARY KEY,
    id_Insumo INT NOT NULL,
    id_Ficha_Técnica INT NOT NULL,
    Cantidad INT NOT NULL,
    id_Medida INT NOT NULL,
    FOREIGN KEY (id_Insumo) REFERENCES Insumo(id_Insumo),
    FOREIGN KEY (id_Ficha_Técnica) REFERENCES Ficha_Técnica(id_Ficha_Técnica),
    FOREIGN KEY (id_Medida) REFERENCES Medida(id_Medida)
);


CREATE TABLE Categoría (
    id_Categoría INT AUTO_INCREMENT PRIMARY KEY,   
    Nombre VARCHAR(50) NOT NULL,
    Descripción VARCHAR(250),
    Cantidad_Producto INT NOT NULL,
    Productos_Disponibles INT NOT NULL,
    Estado BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE Producto (
    id_Producto INT AUTO_INCREMENT PRIMARY KEY,
    id_Categoría INT NOT NULL, 
    Imagenes_URL VARCHAR(200),  
    Referencia VARCHAR(10) NOT NULL,
    Nombre VARCHAR(50) NOT NULL
    Precio INT NOT NULL,
    Stock INT NOT NULL,
    Estado BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (id_Categoría) REFERENCES Categoría(id_Categoría)
);

CREATE TABLE Ficha_Técnica (
    id_Ficha_Técnica INT AUTO_INCREMENT PRIMARY KEY,
    id_Producto INT NOT NULL,
    Responsable VARCHAR(50),  
    Fecha_Inicio DATE,
    Fecha_Fin DATE,   
    Versiones VARCHAR(10),
    Descripciones TEXT,
    FOREIGN KEY (id_Producto) REFERENCES Producto(id_Producto)
);

CREATE TABLE Material_Ficha_Técnica (
    id_Material_Ficha_Técnica INT AUTO_INCREMENT PRIMARY KEY,
    id_Insumo INT NOT NULL,
    id_Ficha_Técnica INT NOT NULL,
    Cantidad INT NOT NULL,
    id_Medida INT NOT NULL,
    FOREIGN KEY (id_Insumo) REFERENCES Insumo(id_Insumo),
    FOREIGN KEY (id_Ficha_Técnica) REFERENCES Ficha_Técnica(id_Ficha_Técnica),
    FOREIGN KEY (id_Medida) REFERENCES Medida(id_Medida)
);

create table Tercero (
id_Tercero INT auto_increment primary key,
Nombre varchar(100),
Contacto varchar(100),
Barrio varchar(100),
Direccion varchar(100),
Telefono int,
Estado bit
);

create table Asignacion_Terceros(
id_Asignacion int auto_increment primary key,
id_Orden int,
id_Tercero int,
Cantidad int,
Fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY id_Orden REFERENCES Orden(id_Orden),
FOREIGN KEY id_Terceros REFERENCES Tercero(id_Tercero)
);

create table Historial_Cambios(
id_historial int auto_increment primary key,
id_Orden int,
id_Estado int,
Fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
id_usuarios int,
FOREIGN KEY id_Orden REFERENCES Orden(id_Orden),
FOREIGN KEY id_Estado REFERENCES Estado(id_Estado),
Foreign key id_Usuarios REferences Usuarios(id_Usuarios)
);

create table Estados_Produccion(
id_Estado int auto_increment primary key,
Nombre_estado varchar(50),
Orden int
);

create table Orden_Produccion(
id_Orden int auto_increment primary key,
Fecha_Creacion TIME,
Fecha_Entrega Time,
Cliente varchar (100),
id_usuarios int,
Foreign key id_Usuarios REferences Usuarios(id_Usuarios)
);

create table Orden_Detalle(
id_Detalle int auto_increment primary key,
id_Orden int,
id_Producto int,
Cantidad int,
Color varchar (30),
Estado bit,
Foreign key id_Orden REferences Orden_Produccion(id_Orden),
Foreign key id_Producto REferences Producto(id_Producto)
);

create table Procesos_Orden_Produccion(
id_Proceso int auto_increment primary key,
id_Detalle int,
id_Estado int,
Fecha time,
id_usuarios int,
Foreign key id_Usuarios REferences Usuarios(id_Usuarios),
Foreign key id_Detalle REferences Orden_Detalle(id_Detalle),
Foreign key id_Estado REferences Estados_Produccion(id_Estado)
);

create table Traslado_Sede(
id_Asignacion_Sede int auto_increment primary key,
id_Orden int,
id_Sede_Origen int,
id_Sede_Destino int,
Cantidad int,
Fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
Foreign key id_Orden REferences Orden_Produccion(id_Orden),
Foreign key id_Sede_Origen REferences Sedes(id_Sede),
Foreign key id_Sede_Destino REferences Sedes(id_Sede)
);