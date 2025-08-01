Te ayudo a crear una guía de implementación de un CRUD con Firestore y autenticación con Google usando AngularFire. <cite/>

## Configuración Inicial

Primero, instala AngularFire en tu proyecto Angular: <cite/>

```bash
ng add @angular/fire
```

Configura los proveedores en tu `app.config.ts`: [1](#0-0) 

## Autenticación con Google

### 1. Configurar el servicio de autenticación

Inyecta el servicio `Auth` en tu componente: [2](#0-1) 

### 2. Implementar login con Google

Para el login con Google, puedes usar `signInWithPopup` con `GoogleAuthProvider`: [3](#0-2) 

### 3. Observar el estado de autenticación

Usa el observable `user` para monitorear el estado de autenticación: [4](#0-3) 

### 4. Implementar logout

Para cerrar sesión: [5](#0-4) 

## CRUD con Firestore

### 1. Configurar Firestore

Agrega el proveedor de Firestore: [6](#0-5) 

Inyecta Firestore en tu componente: [7](#0-6) 

### 2. Leer datos (Read)

Para obtener una colección de documentos: [8](#0-7) 

### 3. Crear documentos (Create)

Para agregar un nuevo documento: [9](#0-8) 

### 4. Actualizar documentos (Update)

Para actualizar un documento existente: [10](#0-9) 

### 5. Eliminar documentos (Delete)

Para eliminar un documento, usa `deleteDoc` con la referencia del documento: [11](#0-10) 

## Ejemplo completo de componente

Un ejemplo práctico que combina autenticación y CRUD se puede ver en el componente de ejemplo: [12](#0-11) 

Este componente muestra cómo:
- Verificar el estado de autenticación para habilitar/deshabilitar controles
- Leer datos de Firestore en tiempo real
- Actualizar documentos con operaciones como `increment`

## Mostrar datos en el template

Para mostrar los datos en tu template HTML: [13](#0-12) 

## Notes

La implementación mostrada usa la nueva API tree-shakable de AngularFire. Si necesitas usar la versión de compatibilidad, puedes consultar la documentación en `docs/compat/` que incluye ejemplos similares con la API anterior. El patrón de inyección de dependencias es consistente en toda la biblioteca, facilitando el uso de múltiples servicios de Firebase juntos.

Wiki pages you might want to explore:
- [Core Architecture (angular/angularfire)](/wiki/angular/angularfire#2)
- [Cloud Functions (angular/angularfire)](/wiki/angular/angularfire#7.2)    