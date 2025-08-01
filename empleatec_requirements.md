# EmpleaTec - Especificación de Requerimientos del Sistema

## 1. Resumen Ejecutivo

**Nombre del Proyecto:** EmpleaTec - Plataforma Digital de Oficios  
**Objetivo:** Desarrollar una plataforma web/móvil que conecte trabajadores de oficios tradicionales con clientes potenciales, reduciendo la informalidad laboral en Ecuador.

**Stack Tecnológico:**
- Frontend: Angular 20 + TailwindCSS
- Backend: Firebase (Firestore, Authentication, Cloud Functions, Storage)
- Servicios: Firebase Cloud Messaging, Google Maps API

---

## 2. Arquitectura del Sistema

### 2.1 Arquitectura General
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Angular 20    │    │    Firebase     │    │   Servicios     │
│   Frontend      │◄──►│   Backend       │◄──►│   Externos      │
│                 │    │                 │    │                 │
│ • Componentes   │    │ • Firestore     │    │ • Google Maps   │
│ • Servicios     │    │ • Auth          │    │ • FCM           │
│ • Guards        │    │ • Storage       │    │ • Cloudinary    │
│ • Interceptors  │    │ • Functions     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2.2 Estructura de Módulos Angular

```typescript
src/
├── app/
│   ├── core/                    # Servicios centrales
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── services/
│   ├── shared/                  # Componentes compartidos
│   │   ├── components/
│   │   ├── pipes/
│   │   └── directives/
│   ├── features/                # Módulos de funcionalidades
│   │   ├── auth/
│   │   ├── profiles/
│   │   ├── search/
│   │   ├── chat/
│   │   ├── reviews/
│   │   ├── notifications/
│   │   └── admin/
│   └── layouts/                 # Layouts de la aplicación
```

---

## 3. Requerimientos Funcionales

### RF1 - Sistema de Autenticación y Autorización
**Descripción:** Registro y login de usuarios (trabajadores y clientes)
**Criterios de Aceptación:**
- Registro con email/password
- Login con Google/Facebook (Firebase Auth)
- Verificación de email obligatoria
- Recuperación de contraseña
- Logout seguro

**Implementación Firebase:**
```typescript
// Authentication Service
signUp(email: string, password: string, userType: 'worker' | 'client')
signIn(email: string, password: string)
signInWithGoogle()
signInWithFacebook()
resetPassword(email: string)
signOut()
```

### RF2 - Gestión de Perfiles Multimedia
**Descripción:** Creación y edición de perfiles con fotos, descripción y experiencia
**Criterios de Aceptación:**
- Mínimo 3 fotos del portafolio (trabajadores)
- Descripción obligatoria (max 500 caracteres)
- Categorías de oficios predefinidas
- Información de contacto
- Certificaciones opcionales

**Componentes Angular:**
- ProfileCreationComponent
- ProfileEditComponent
- ImageUploadComponent
- CategorySelectorComponent

### RF3 - Sistema de Búsqueda Geolocalizada
**Descripción:** Búsqueda de trabajadores por oficio, ubicación y disponibilidad
**Criterios de Aceptación:**
- Filtro por categoría de oficio
- Búsqueda por radio de distancia (1km, 5km, 10km, ciudad)
- Ordenamiento por proximidad, calificación, precio
- Mapa interactivo con marcadores

**Implementación:**
```typescript
// Search Service
searchWorkers(filters: SearchFilters): Observable<Worker[]>
getWorkersByLocation(lat: number, lng: number, radius: number)
getNearbyWorkers(userLocation: Location)
```

### RF4 - Sistema de Calificaciones Bidireccional
**Descripción:** Calificación de 1-5 estrellas con comentarios opcionales
**Criterios de Aceptación:**
- Solo usuarios con transacciones completadas pueden calificar
- Calificación numérica (1-5 estrellas)
- Comentario opcional (max 200 caracteres)
- Prevención de auto-calificación
- Cálculo automático de promedio

### RF5 - Chat en Tiempo Real
**Descripción:** Mensajería directa entre clientes y trabajadores
**Criterios de Aceptación:**
- Chat en tiempo real usando Firestore real-time listeners
- Envío de texto e imágenes
- Indicadores de estado (enviado, entregado, leído)
- Historial de conversaciones
- Notificaciones push de nuevos mensajes

### RF6 - Sistema de Notificaciones
**Descripción:** Notificaciones push para eventos importantes
**Criterios de Aceptación:**
- Nuevos trabajos disponibles (trabajadores)
- Nuevos mensajes
- Calificaciones recibidas
- Recordatorios de trabajos programados
- Notificaciones configurables por usuario

### RF7 - Panel de Administración
**Descripción:** Dashboard para administradores del sistema
**Criterios de Aceptación:**
- Estadísticas de usuarios activos
- Reportes de problemas/denuncias
- Gestión de categorías de oficios
- Moderación de contenido
- Analytics de uso de la plataforma

---

## 4. Requerimientos No Funcionales

### RNF1 - Rendimiento
- Tiempo de carga inicial < 3 segundos
- Tiempo de respuesta de búsquedas < 2 segundos
- Lazy loading de imágenes y componentes
- Optimización de bundle size con Angular CLI

### RNF2 - Seguridad
- Autenticación Firebase con tokens JWT
- Validación de entrada en frontend y backend
- Reglas de seguridad Firestore estrictas
- Sanitización de contenido generado por usuarios
- HTTPS obligatorio

### RNF3 - Escalabilidad
- Arquitectura serverless con Firebase Functions
- Base de datos NoSQL escalable (Firestore)
- CDN para assets estáticos
- Optimización para 10,000+ usuarios concurrentes

### RNF4 - Usabilidad
- Diseño responsive (mobile-first)
- Interfaz intuitiva para usuarios con poca experiencia digital
- Accesibilidad WCAG 2.1 nivel AA
- Soporte offline básico

### RNF5 - Mantenibilidad
- Código TypeScript tipado
- Documentación técnica completa
- Testing unitario y e2e
- CI/CD pipeline automatizado

---

## 5. Estructura de Firebase

### 5.1 Firestore Collections

#### Users Collection
```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  userType: 'worker' | 'client' | 'admin';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
  };
  notifications: {
    newJobs: boolean;
    messages: boolean;
    reviews: boolean;
  };
}
```

#### Workers Collection
```typescript
interface Worker {
  uid: string; // Reference to User
  categories: string[]; // Array of service categories
  description: string;
  experience: number; // Years of experience
  portfolio: {
    images: string[]; // Storage URLs
    descriptions: string[];
  };
  certifications?: string[]; // Storage URLs
  availability: {
    schedule: {
      [day: string]: {
        available: boolean;
        startTime?: string;
        endTime?: string;
      };
    };
    isAvailable: boolean;
  };
  pricing: {
    hourlyRate?: number;
    fixedRates?: { [service: string]: number };
  };
  stats: {
    averageRating: number;
    totalJobs: number;
    totalReviews: number;
  };
  verificationStatus: 'pending' | 'verified' | 'rejected';
}
```

#### Jobs Collection
```typescript
interface Job {
  id: string;
  clientId: string;
  workerId?: string;
  title: string;
  description: string;
  category: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  budget: {
    type: 'hourly' | 'fixed';
    amount: number;
  };
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  scheduledDate?: Timestamp;
  images?: string[];
  applications: {
    workerId: string;
    appliedAt: Timestamp;
    message?: string;
  }[];
}
```

#### Reviews Collection
```typescript
interface Review {
  id: string;
  jobId: string;
  reviewerId: string; // User who gives the review
  revieweeId: string; // User who receives the review
  rating: number; // 1-5
  comment?: string;
  createdAt: Timestamp;
  isVisible: boolean;
}
```

#### Chats Collection
```typescript
interface Chat {
  id: string;
  participants: string[]; // Array of user IDs
  lastMessage: {
    text: string;
    senderId: string;
    timestamp: Timestamp;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Subcollection: messages
interface Message {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  timestamp: Timestamp;
  readBy: string[]; // Array of user IDs who read the message
}
```

#### Categories Collection
```typescript
interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  subcategories?: string[];
}
```

#### Reports Collection
```typescript
interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  type: 'user' | 'job' | 'review';
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Timestamp;
  adminNotes?: string;
}
```

### 5.2 Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Workers profiles are readable by authenticated users
    match /workers/{workerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == workerId;
    }
    
    // Jobs are readable by authenticated users
    match /jobs/{jobId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == resource.data.clientId;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.clientId || 
         request.auth.uid == resource.data.workerId);
    }
    
    // Reviews are readable by everyone, writable by participants
    match /reviews/{reviewId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.reviewerId;
    }
    
    // Chat security
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      }
    }
  }
}
```

### 5.3 Firebase Storage Structure
```
/portfolios/{workerId}/{imageId}.jpg
/certifications/{workerId}/{certId}.pdf
/job-images/{jobId}/{imageId}.jpg
/chat-images/{chatId}/{messageId}.jpg
/profile-pictures/{userId}/avatar.jpg
```

---

## 6. Servicios Angular Principales

### 6.1 Core Services
```typescript
// AuthService
@Injectable({ providedIn: 'root' })
export class AuthService {
  signUp(userData: SignUpData): Promise<UserCredential>
  signIn(email: string, password: string): Promise<UserCredential>
  signOut(): Promise<void>
  getCurrentUser(): Observable<User | null>
  updateProfile(profileData: Partial<User>): Promise<void>
}

// GeolocationService
@Injectable({ providedIn: 'root' })
export class GeolocationService {
  getCurrentPosition(): Promise<GeolocationPosition>
  calculateDistance(pos1: Location, pos2: Location): number
  getAddressFromCoordinates(lat: number, lng: number): Promise<string>
}

// NotificationService
@Injectable({ providedIn: 'root' })
export class NotificationService {
  requestPermission(): Promise<string>
  sendNotification(userId: string, notification: NotificationData): Promise<void>
  subscribeToTopic(topic: string): Promise<void>
}
```

### 6.2 Feature Services
```typescript
// WorkerService
@Injectable({ providedIn: 'root' })
export class WorkerService {
  createWorkerProfile(workerData: Worker): Promise<void>
  updateWorkerProfile(workerId: string, updates: Partial<Worker>): Promise<void>
  getWorkerProfile(workerId: string): Observable<Worker>
  searchWorkers(filters: SearchFilters): Observable<Worker[]>
  getNearbyWorkers(location: Location, radius: number): Observable<Worker[]>
}

// JobService
@Injectable({ providedIn: 'root' })
export class JobService {
  createJob(jobData: Job): Promise<string>
  getJobsByClient(clientId: string): Observable<Job[]>
  getJobsByWorker(workerId: string): Observable<Job[]>
  applyToJob(jobId: string, application: JobApplication): Promise<void>
  updateJobStatus(jobId: string, status: JobStatus): Promise<void>
}

// ChatService
@Injectable({ providedIn: 'root' })
export class ChatService {
  createChat(participants: string[]): Promise<string>
  getChats(userId: string): Observable<Chat[]>
  getMessages(chatId: string): Observable<Message[]>
  sendMessage(chatId: string, message: MessageData): Promise<void>
  markAsRead(chatId: string, messageId: string): Promise<void>
}

// ReviewService
@Injectable({ providedIn: 'root' })
export class ReviewService {
  createReview(reviewData: Review): Promise<void>
  getReviewsForWorker(workerId: string): Observable<Review[]>
  getReviewsForClient(clientId: string): Observable<Review[]>
  calculateAverageRating(reviews: Review[]): number
}
```

---

## 7. Componentes Principales

### 7.1 Estructura de Componentes
```typescript
// Auth Components
- LoginComponent
- RegisterComponent
- ForgotPasswordComponent
- ProfileSetupComponent

// Search Components
- SearchComponent
- WorkerCardComponent
- WorkerListComponent
- MapViewComponent
- FilterComponent

// Profile Components
- WorkerProfileComponent
- ClientProfileComponent
- ProfileEditComponent
- PortfolioComponent

// Job Components
- JobCreationComponent
- JobListComponent
- JobDetailComponent
- JobApplicationComponent

// Chat Components
- ChatListComponent
- ChatComponent
- MessageComponent

// Review Components
- ReviewFormComponent
- ReviewListComponent
- RatingComponent

// Admin Components
- AdminDashboardComponent
- UserManagementComponent
- ReportsComponent
- StatisticsComponent
```

---

## 8. Roadmap de Desarrollo

### Fase 1 (4 semanas) - MVP
- [ ] Configuración inicial Angular 20 + Firebase
- [ ] Sistema de autenticación
- [ ] Creación de perfiles básicos
- [ ] Búsqueda simple de trabajadores
- [ ] Sistema de calificaciones básico

### Fase 2 (3 semanas) - Funcionalidades Core
- [ ] Chat en tiempo real
- [ ] Geolocalización y mapas
- [ ] Sistema de notificaciones
- [ ] Gestión de trabajos/proyectos
- [ ] Upload de imágenes y portafolios

### Fase 3 (2 semanas) - Optimización
- [ ] Panel de administración
- [ ] Sistema de reportes
- [ ] Optimización de rendimiento
- [ ] Testing y QA
- [ ] Despliegue en producción

---

## 9. Consideraciones de Seguridad

### 9.1 Autenticación y Autorización
- Multi-factor authentication opcional
- Verificación de identidad para trabajadores
- Roles y permisos granulares
- Session management seguro

### 9.2 Protección de Datos
- Encriptación de datos sensibles
- Cumplimiento GDPR y Ley de Protección de Datos Ecuador
- Anonimización de datos analytics
- Backup y recovery procedures

### 9.3 Validación y Sanitización
- Input validation en cliente y servidor
- XSS protection
- SQL injection prevention (N/A con Firestore)
- File upload security

---

## 10. Métricas y KPIs

### 10.1 Métricas Técnicas
- Tiempo de carga de páginas
- Tasa de error de la aplicación
- Uptime del sistema
- Utilización de Firebase quota

### 10.2 Métricas de Negocio
- Número de usuarios registrados
- Trabajos completados mensualmente
- Tasa de retención de usuarios
- Calificación promedio de satisfacción
- Tiempo promedio de respuesta entre cliente-trabajador

---

*Documento generado para el proyecto EmpleaTec - Universidad Internacional del Ecuador*
*Versión 1.0 - Julio 2025*