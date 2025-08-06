import { ChangeDetectionStrategy, Component, computed, signal, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// --- INTERFACES Y TIPOS ---
interface PortfolioItem {
  id: string;
  title: string;
  image: string;
  description: string;
  date: string;
  client: string;
}

interface Review {
  id: string;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number;
  comment: string;
  projectTitle: string;
  createdAt: Date;
}

interface Project {
  id: string;
  title: string;
  image: string;
  status: 'completed' | 'in-progress' | 'pending';
  budget: number;
  date: string | Date;
}

interface ClientStats {
  projectsPublished: number;
  projectsCompleted: number;
  projectsInProgress: number;
  totalSpent: number;
  averageRating: number;
}

interface UserProfile {
  userType: 'client' | 'worker';
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  profileImage: string;
  coverImage: string;
  memberSince: Date;
  hourlyRate?: number;
  yearsExperience?: number;
  specialties?: string[];
  completedJobs?: number;
  rating?: number;
  portfolio?: PortfolioItem[];
  reviews?: Review[];
}

type TabType = 'projects' | 'profile' | 'settings' | 'portfolio' | 'reviews' | 'about';

@Component({
  selector: 'app-my-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-profile-page.component.html',
  styleUrls: ['./my-profile-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyProfilePageComponent {
  private router = inject(Router);

  // --- DATOS DEL COMPONENTE ---
  readonly user = signal<UserProfile>({
    userType: 'worker',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@email.com',
    phone: '55 8765 4321',
    location: 'Polanco, CDMX',
    bio: 'Carpintero profesional con más de 12 años de experiencia en proyectos residenciales y comerciales. Especializado en cocinas integrales, muebles a medida y restauración de madera.',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=300&fit=crop',
    memberSince: new Date(2018, 3, 20),
    hourlyRate: 450,
    yearsExperience: 12,
    specialties: ['carpinteria', 'ebanisteria', 'restauracion'],
    completedJobs: 156,
    rating: 4.9,
    portfolio: [
      { 
        id: '1', 
        title: 'Cocina moderna minimalista', 
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', 
        description: 'Diseño e instalación completa de cocina integral con acabados de lujo', 
        date: 'Marzo 2024', 
        client: 'Ana Rodríguez' 
      }
    ],
    reviews: [
      { 
        id: '1', 
        reviewerName: 'Ana Rodríguez', 
        reviewerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5c8?w=100&h=100&fit=crop&crop=face', 
        rating: 5, 
        comment: 'Excelente trabajo! Carlos superó todas mis expectativas con la cocina.', 
        projectTitle: 'Cocina moderna minimalista', 
        createdAt: new Date(Date.now() - 604800000) 
      }
    ]
  });

  readonly isEditing = signal(false);
  readonly editData = signal<Partial<UserProfile>>({});
  readonly activeTab = signal<TabType>('profile');
  readonly editButtonText = computed(() => this.isEditing() ? 'Guardar' : 'Editar');

  // Datos para la pestaña de proyectos (si es cliente)
  readonly clientStats: ClientStats = {
    projectsPublished: 12,
    projectsCompleted: 8,
    projectsInProgress: 3,
    totalSpent: 125000,
    averageRating: 4.7
  };

  readonly recentProjects: Project[] = [
    {
      id: '1',
      title: 'Remodelación de cocina',
      image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=300&fit=crop',
      status: 'completed',
      budget: 45000,
      date: new Date(2024, 2, 15)
    },
    {
      id: '2',
      title: 'Construcción de terraza',
      image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&h=300&fit=crop',
      status: 'in-progress',
      budget: 65000,
      date: new Date(2024, 3, 1)
    }
  ];

  // Opciones de especialidades para el formulario de edición
  readonly specialtyOptions = [
    { id: 'carpinteria', name: 'Carpintería', icon: '🪚' },
    { id: 'ebanisteria', name: 'Ebanistería', icon: '🪑' },
    { id: 'restauracion', name: 'Restauración', icon: '🔨' },
    { id: 'muebles', name: 'Muebles a medida', icon: '🛋️' },
    { id: 'cocinas', name: 'Cocinas integrales', icon: '🍳' }
  ];

  // --- MÉTODOS DE ACCIÓN ---
  onBack(): void {
    this.router.navigate(['/dashboard-worker']);
  }

  toggleEdit(): void {
    if (!this.isEditing()) {
      this.editData.set({ ...this.user() });
    }
    this.isEditing.update(value => !value);
  }

  handleSave(): void {
    this.user.update(current => ({ ...current, ...this.editData() }));
    this.isEditing.set(false);
  }

  setActiveTab(tab: TabType): void {
    this.activeTab.set(tab);
  }

  // --- MÉTODOS AUXILIARES ---
  updateEditData<K extends keyof UserProfile>(key: K, value: UserProfile[K]): void {
    this.editData.update(current => ({ ...current, [key]: value }));
  }

  toggleSpecialty(specialtyId: string): void {
    const currentSpecialties = this.editData().specialties || [];
    const newSpecialties = currentSpecialties.includes(specialtyId)
      ? currentSpecialties.filter(id => id !== specialtyId)
      : [...currentSpecialties, specialtyId];
    
    this.updateEditData('specialties', newSpecialties);
  }

  getSpecialtyName(specialtyId: string): string {
    const specialty = this.specialtyOptions.find(s => s.id === specialtyId);
    return specialty ? specialty.name : '';
  }

  getSpecialtyIcon(specialtyId: string): string {
    const specialty = this.specialtyOptions.find(s => s.id === specialtyId);
    return specialty ? specialty.icon : '';
  }

  getProjectStatusInfo(status: string): { text: string; color: string } {
    const statusMap: Record<string, { text: string; color: string }> = {
      'completed': { text: 'Completado', color: 'bg-green-100 text-green-800' },
      'in-progress': { text: 'En progreso', color: 'bg-yellow-100 text-yellow-800' },
      'pending': { text: 'Pendiente', color: 'bg-blue-100 text-blue-800' }
    };
    return statusMap[status] || { text: 'Desconocido', color: 'bg-gray-100 text-gray-800' };
  }

  formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      return date;
    }
    return formatDate(date, 'dd/MM/yyyy', 'en-US');
  }

  onLogout(): void {
    this.router.navigate(['/login']);
  }

  onNavigate(destination: string, data?: any): void {
    console.log(`Navegando a ${destination}`, data);
    // Implementación real de navegación aquí
  }
}