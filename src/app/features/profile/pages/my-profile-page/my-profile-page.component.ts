import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';

// --- INTERFACES PARA TIPADO FUERTE ---
export interface Project {
  id: string;
  title: string;
  status: 'completed' | 'in_progress' | 'open';
  budget: number;
  date: Date;
  image: string;
}

export interface UserProfile {
  userType: 'client' | 'worker';
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  profileImage: string;
  memberSince: Date;
  hourlyRate?: number;
  yearsExperience?: number;
  specialties?: string[];
  completedJobs?: number;
  rating?: number;
}

@Component({
  selector: 'app-my-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-profile-page.component.html',
  styleUrls: ['./my-profile-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyProfilePageComponent {
  // SOLUCIÓN: Cambiado a 'client' para mostrar la pestaña y contenido correctos.
  private userType: 'client' | 'worker' = 'client';

  readonly user = signal<UserProfile>({
    userType: this.userType,
    name: this.userType === 'client' ? 'Gabriela Mistral' : 'Alonso Quijano',
    email: this.userType === 'client' ? 'gabi.mistral@email.com' : 'alonso.quijano@email.com',
    phone: '55 1234 5678',
    location: 'Ciudad de México, MX',
    bio: 'Busco profesionales para proyectos de renovación.',
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
    memberSince: new Date(2022, 5, 15),
    // ...el resto de los datos no afecta a esta lógica
  });

  readonly editData = signal(this.user());
  readonly isEditing = signal(false);
  
  // Esta señal ahora se inicializará correctamente a 'projects'
  readonly activeTab = signal(this.user().userType === 'client' ? 'projects' : 'profile');

  readonly editButtonText = computed(() => this.isEditing() ? 'Guardar' : 'Editar');

  readonly clientStats = {
    projectsPublished: 12,
    projectsCompleted: 8,
    projectsInProgress: 2,
    totalSpent: 125000,
    averageRating: 4.8,
  };

  readonly recentProjects: Project[] = [
    {
      id: '1',
      title: 'Renovación de cocina integral',
      status: 'completed',
      budget: 25000,
      date: new Date(Date.now() - 86400000 * 20),
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop'
    },
    {
      id: '2',
      title: 'Instalación sistema eléctrico',
      status: 'in_progress',
      budget: 40000,
      date: new Date(Date.now() - 86400000 * 10),
      image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=300&h=200&fit=crop'
    },
    {
      id: '3',
      title: 'Pintura interior departamento',
      status: 'open',
      budget: 12000,
      date: new Date(Date.now() - 86400000 * 2),
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300&h=200&fit=crop'
    }
  ];

  readonly specialtyOptions = [
    { id: 'carpinteria', name: 'Carpintería' },
    { id: 'plomeria', name: 'Plomería' },
    { id: 'electricidad', name: 'Electricidad' },
  ];

  onBack(): void { console.log('Volver'); }
  onLogout(): void { console.log('Cerrar sesión'); }

  toggleEdit(): void {
    if (this.isEditing()) {
      this.user.set(this.editData());
    }
    this.isEditing.update(value => !value);
  }

  setActiveTab(tab: string): void { this.activeTab.set(tab); }

  updateEditData(field: keyof UserProfile, value: any): void {
    this.editData.update(data => ({ ...data, [field]: value }));
  }

  formatDate(date: Date): string {
    return formatDate(date, 'dd/MMM/yyyy', 'es-MX');
  }

  getProjectStatusInfo(status: string): { text: string; color: string } {
    switch (status) {
      case 'open': return { text: 'Abierto', color: 'bg-blue-100 text-blue-800' };
      case 'in_progress': return { text: 'En Progreso', color: 'bg-yellow-100 text-yellow-800' };
      case 'completed': return { text: 'Completado', color: 'bg-green-100 text-green-800' };
      default: return { text: 'Desconocido', color: 'bg-gray-100 text-gray-800' };
    }
  }

  toggleSpecialty(specialtyId: string): void {
    this.editData.update(data => {
      const specialties = data.specialties || [];
      const newSpecialties = specialties.includes(specialtyId)
        ? specialties.filter(id => id !== specialtyId)
        : [...specialties, specialtyId];
      return { ...data, specialties: newSpecialties };
    });
  }

  getSpecialtyName(specId: string): string {
    const specialty = this.specialtyOptions.find(s => s.id === specId);
    return specialty ? specialty.name : specId;
  }
}