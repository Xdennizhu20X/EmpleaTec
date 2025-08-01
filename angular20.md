# Estructura de Carpetas y Mejores Prácticas para Angular 20 (2025)

## 🚨 Cambios Importantes en Angular 20

### Nuevas Convenciones de Nomenclatura

Angular 20 introduce cambios significativos en las convenciones de nomenclatura para simplificar y modernizar el desarrollo:

#### ❌ Antes (Angular < 20)
```
user-profile.component.ts
user-profile.component.html
user-profile.component.scss
auth.service.ts
highlight.directive.ts
auth.guard.ts
```

#### ✅ Ahora (Angular 20)
```
user-profile.ts
user-profile.html
user-profile.scss
auth-store.ts          # o auth-api.ts, user-client.ts
highlight.ts
auth-guard.ts          # mantiene sufijo con guión
```

### Reglas de Nomenclatura Angular 20

- **SIN sufijos**: Componentes, Directivas y Servicios
- **CON sufijos**: Pipes, Guards, Resolvers, Interceptors y Modules
- **Guiones en lugar de puntos**: `auth-guard.ts` en lugar de `auth.guard.ts`
- **Nombres específicos del dominio**: `auth-store.ts`, `user-api.ts`, `data-client.ts`

## 📁 Estructura de Carpetas Recomendada

```
src/
├── app/
│   ├── core/                           # 🔐 Servicios globales singleton
│   │   ├── services/
│   │   │   ├── auth-store.ts
│   │   │   ├── logger.ts
│   │   │   ├── notification-api.ts
│   │   │   └── error-handler.ts
│   │   ├── guards/
│   │   │   ├── auth-guard.ts
│   │   │   └── role-guard.ts
│   │   ├── interceptors/
│   │   │   ├── api-interceptor.ts
│   │   │   └── error-interceptor.ts
│   │   ├── models/
│   │   │   ├── user.ts
│   │   │   ├── api-response.ts
│   │   │   └── error.ts
│   │   └── utils/
│   │       ├── validators.ts
│   │       └── constants.ts
│   │
│   ├── shared/                         # 🔄 Componentes reutilizables
│   │   ├── components/
│   │   │   ├── button/
│   │   │   │   ├── button.ts
│   │   │   │   ├── button.html
│   │   │   │   └── button.scss
│   │   │   ├── modal/
│   │   │   │   ├── modal.ts
│   │   │   │   ├── modal.html
│   │   │   │   └── modal.scss
│   │   │   ├── notification/
│   │   │   │   ├── notification.ts
│   │   │   │   ├── notification.html
│   │   │   │   └── notification.scss
│   │   │   └── loading-spinner/
│   │   │       ├── loading-spinner.ts
│   │   │       ├── loading-spinner.html
│   │   │       └── loading-spinner.scss
│   │   ├── directives/
│   │   │   ├── highlight.ts
│   │   │   └── auto-focus.ts
│   │   ├── pipes/
│   │   │   ├── format-date-p.ts
│   │   │   ├── currency-p.ts
│   │   │   └── truncate-p.ts
│   │   └── utils/
│   │       ├── string-utils.ts
│   │       ├── date-utils.ts
│   │       └── validation-utils.ts
│   │
│   ├── features/                       # 🏢 Características del negocio
│   │   ├── auth/
│   │   │   ├── pages/
│   │   │   │   ├── login/
│   │   │   │   │   ├── login.ts
│   │   │   │   │   ├── login.html
│   │   │   │   │   └── login.scss
│   │   │   │   ├── register/
│   │   │   │   │   ├── register.ts
│   │   │   │   │   ├── register.html
│   │   │   │   │   └── register.scss
│   │   │   │   └── forgot-password/
│   │   │   │       ├── forgot-password.ts
│   │   │   │       ├── forgot-password.html
│   │   │   │       └── forgot-password.scss
│   │   │   ├── components/
│   │   │   │   └── auth-form/
│   │   │   │       ├── auth-form.ts
│   │   │   │       ├── auth-form.html
│   │   │   │       └── auth-form.scss
│   │   │   ├── services/
│   │   │   │   ├── auth-api.ts
│   │   │   │   └── token-storage.ts
│   │   │   ├── models/
│   │   │   │   ├── login-request.ts
│   │   │   │   ├── auth-response.ts
│   │   │   │   └── user-profile.ts
│   │   │   └── auth.routes.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── pages/
│   │   │   │   ├── overview/
│   │   │   │   │   ├── overview.ts
│   │   │   │   │   ├── overview.html
│   │   │   │   │   └── overview.scss
│   │   │   │   └── analytics/
│   │   │   │       ├── analytics.ts
│   │   │   │       ├── analytics.html
│   │   │   │       └── analytics.scss
│   │   │   ├── components/
│   │   │   │   ├── dashboard-card/
│   │   │   │   │   ├── dashboard-card.ts
│   │   │   │   │   ├── dashboard-card.html
│   │   │   │   │   └── dashboard-card.scss
│   │   │   │   └── stats-widget/
│   │   │   │       ├── stats-widget.ts
│   │   │   │       ├── stats-widget.html
│   │   │   │       └── stats-widget.scss
│   │   │   ├── services/
│   │   │   │   └── dashboard-api.ts
│   │   │   └── dashboard.routes.ts
│   │   │
│   │   ├── products/
│   │   │   ├── pages/
│   │   │   │   ├── product-list/
│   │   │   │   │   ├── product-list.ts
│   │   │   │   │   ├── product-list.html
│   │   │   │   │   └── product-list.scss
│   │   │   │   ├── product-detail/
│   │   │   │   │   ├── product-detail.ts
│   │   │   │   │   ├── product-detail.html
│   │   │   │   │   └── product-detail.scss
│   │   │   │   └── product-create/
│   │   │   │       ├── product-create.ts
│   │   │   │       ├── product-create.html
│   │   │   │       └── product-create.scss
│   │   │   ├── components/
│   │   │   │   ├── product-card/
│   │   │   │   │   ├── product-card.ts
│   │   │   │   │   ├── product-card.html
│   │   │   │   │   └── product-card.scss
│   │   │   │   └── product-filter/
│   │   │   │       ├── product-filter.ts
│   │   │   │       ├── product-filter.html
│   │   │   │       └── product-filter.scss
│   │   │   ├── services/
│   │   │   │   ├── product-api.ts
│   │   │   │   └── product-store.ts
│   │   │   ├── models/
│   │   │   │   ├── product.ts
│   │   │   │   ├── category.ts
│   │   │   │   └── product-filter.ts
│   │   │   └── products.routes.ts
│   │   │
│   │   └── users/
│   │       ├── pages/
│   │       │   ├── user-list/
│   │       │   ├── user-profile/
│   │       │   └── user-settings/
│   │       ├── components/
│   │       ├── services/
│   │       ├── models/
│   │       └── users.routes.ts
│   │
│   ├── layout/                         # 🎨 Componentes de layout
│   │   ├── header/
│   │   │   ├── header.ts
│   │   │   ├── header.html
│   │   │   └── header.scss
│   │   ├── sidebar/
│   │   │   ├── sidebar.ts
│   │   │   ├── sidebar.html
│   │   │   └── sidebar.scss
│   │   ├── footer/
│   │   │   ├── footer.ts
│   │   │   ├── footer.html
│   │   │   └── footer.scss
│   │   └── main-layout/
│   │       ├── main-layout.ts
│   │       ├── main-layout.html
│   │       └── main-layout.scss
│   │
│   ├── app.routes.ts                   # 📍 Configuración de rutas principal
│   ├── app.config.ts                   # ⚙️ Configuración de la aplicación
│   ├── app.ts                          # 🚀 Componente raíz
│   ├── app.html
│   └── app.scss
```

## 🏗️ Ejemplos de Implementación

### 1. Componente Standalone (Angular 20)

```typescript
// features/products/pages/product-list/product-list.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductApi } from '../../services/product-api';
import { ProductCard } from '../../components/product-card/product-card';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCard],
  selector: 'app-product-list',
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList {
  private productApi = inject(ProductApi);
  
  products$ = this.productApi.getProducts();
  
  onProductSelect(productId: string) {
    // Lógica de selección
  }
}
```

### 2. Servicio con Nomenclatura Angular 20

```typescript
// features/products/services/product-api.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductApi {
  private http = inject(HttpClient);
  private baseUrl = 'api/products';

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl);
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product);
  }
}
```

### 3. Configuración de Rutas con Lazy Loading

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => 
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    loadComponent: () => 
      import('./features/dashboard/pages/overview/overview')
        .then(m => m.Overview),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'products',
    loadChildren: () => 
      import('./features/products/products.routes').then(m => m.PRODUCTS_ROUTES),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'users',
    loadChildren: () => 
      import('./features/users/users.routes').then(m => m.USERS_ROUTES),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: '**',
    loadComponent: () => 
      import('./shared/components/not-found/not-found')
        .then(m => m.NotFound)
  }
];
```

### 4. Rutas de Feature

```typescript
// features/products/products.routes.ts
import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./pages/product-list/product-list').then(m => m.ProductList)
  },
  {
    path: 'create',
    loadComponent: () => 
      import('./pages/product-create/product-create').then(m => m.ProductCreate)
  },
  {
    path: ':id',
    loadComponent: () => 
      import('./pages/product-detail/product-detail').then(m => m.ProductDetail)
  },
  {
    path: ':id/edit',
    loadComponent: () => 
      import('./pages/product-edit/product-edit').then(m => m.ProductEdit)
  }
];
```

### 5. Configuración de la Aplicación

```typescript
// app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { apiInterceptor } from './core/interceptors/api-interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([apiInterceptor, errorInterceptor])
    ),
    provideAnimations(),
    // Otros providers globales
  ]
};
```

### 6. Guard Moderno

```typescript
// core/guards/auth-guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../services/auth-store';

export const authGuard = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};
```

## 📋 Mejores Prácticas Detalladas

### Organización de Archivos

#### ✅ Hacer
- **Un concepto por archivo**: Cada componente, servicio o pipe en su propio archivo
- **Nombres descriptivos**: `user-profile.ts`, `product-api.ts`, `auth-store.ts`
- **Estructura plana**: Máximo 7 archivos por carpeta antes de crear subcarpetas
- **Agrupación por feature**: Mantén archivos relacionados juntos
- **Standalone components**: Usa `standalone: true` para todos los nuevos componentes

#### ❌ Evitar
- **Carpetas técnicas en la raíz**: No crear `/components`, `/services`, `/directives`
- **Archivos genéricos**: Evita nombres como `utils.ts`, `helpers.ts`
- **Anidación excesiva**: No más de 4-5 niveles de profundidad
- **Mezclar conceptos**: Un archivo debe tener una responsabilidad clara

### Nomenclatura de Archivos

```typescript
// ✅ Correcto (Angular 20)
auth-store.ts              // Servicio de autenticación
user-profile.ts            // Componente de perfil
product-list.ts            // Componente de lista
auth-guard.ts             // Guard (mantiene sufijo)
format-date-p.ts          // Pipe (mantiene sufijo)

// ❌ Incorrecto (convenciones antiguas)
auth.service.ts
user-profile.component.ts
product-list.component.ts
auth.guard.ts
format-date.pipe.ts
```

### Importaciones y Dependencias

```typescript
// ✅ Standalone Component con imports explícitos
@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ProductCard,
    LoadingSpinner
  ],
  // ...
})
export class ProductList { }
```

### Lazy Loading Granular

```typescript
// ✅ Lazy loading a nivel de componente
{
  path: 'profile',
  loadComponent: () => 
    import('./features/users/pages/user-profile/user-profile')
      .then(m => m.UserProfile)
}

// ✅ Lazy loading de rutas completas
{
  path: 'products',
  loadChildren: () => 
    import('./features/products/products.routes')
      .then(m => m.PRODUCTS_ROUTES)
}
```

## 🚀 Migración desde Versiones Anteriores

### Paso 1: Actualizar Angular CLI
```bash
npm install -g @angular/cli@latest
ng update @angular/core @angular/cli
```

### Paso 2: Migrar a Standalone Components
```bash
ng generate @angular/core:standalone
```

### Paso 3: Actualizar Nomenclatura
1. Renombrar archivos siguiendo las nuevas convenciones
2. Actualizar imports en toda la aplicación
3. Modificar configuraciones de build si es necesario

### Paso 4: Implementar Lazy Loading Granular
1. Convertir componentes a standalone
2. Actualizar configuración de rutas
3. Usar `loadComponent` para componentes individuales

## 💡 Beneficios de esta Estructura

### Rendimiento
- **Lazy loading granular**: Carga solo el código necesario
- **Tree shaking mejorado**: Eliminación automática de código no usado
- **Bundles más pequeños**: Separación efectiva del código

### Mantenibilidad
- **Código organizado**: Fácil localización de archivos
- **Separación de responsabilidades**: Cada feature es independiente
- **Escalabilidad**: Estructura que crece con el proyecto

### Experiencia de Desarrollo
- **Menos boilerplate**: Sin necesidad de NgModules para cada feature
- **Imports automáticos**: Angular Language Service maneja las dependencias
- **Testing simplificado**: Componentes standalone son más fáciles de testear

## 🛠️ Herramientas Recomendadas

### Angular CLI Schematics
```bash
# Crear componente standalone
ng g c features/products/components/product-card --standalone

# Crear servicio
ng g s features/products/services/product-api

# Crear guard funcional
ng g g core/guards/auth --functional
```

### Extensiones VS Code Recomendadas
- **Angular Language Service**: Auto-imports y IntelliSense
- **Angular Snippets**: Plantillas de código
- **Prettier**: Formateo automático de código
- **ESLint**: Linting para Angular

Esta estructura representa el estado del arte en desarrollo Angular 2025, siguiendo las últimas recomendaciones del equipo de Angular y las mejores prácticas de la industria.