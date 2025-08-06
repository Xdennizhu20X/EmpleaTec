import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkerProfile, Review } from '../../models/worker.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-worker-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './worker-profile.html',
  styleUrls: ['./worker-profile.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkerProfileComponent {
  selectedTab = signal('portfolio');
  isFavorited = signal(false);
  private router = inject(Router);

  // Mock data for the worker profile
  readonly worker = signal<WorkerProfile>({
    id: '1',
    name: 'Carlos Mendoza',
    specialty: 'Carpintería',
    rating: 4.9,
    reviewCount: 127,
    location: 'Polanco, CDMX',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=300&fit=crop',
    price: '$450/día',
    isVerified: true,
    isOnline: true,
    completedJobs: 156,
    yearsExperience: 12,
    specialties: ['carpinteria', 'ebanisteria', 'restauracion'],
    bio: 'Carpintero profesional con más de 12 años de experiencia en proyectos residenciales y comerciales. Especializado en cocinas integrales, muebles a medida y restauración de madera. Mi enfoque siempre es brindar la más alta calidad en cada proyecto.',
    portfolio: [
      { id: '1', title: 'Cocina moderna minimalista', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', description: 'Diseño e instalación completa de cocina integral con acabados de lujo', date: 'Marzo 2024', client: 'Ana Rodríguez' },
      { id: '2', title: 'Muebles de sala a medida', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop', description: 'Set completo de muebles personalizados con diseño minimalista', date: 'Febrero 2024', client: 'Luis Martínez' },
      { id: '3', title: 'Closet walk-in de lujo', image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop', description: 'Closet personalizado con sistema organizador y acabados premium', date: 'Enero 2024', client: 'María González' },
    ],
    reviews: [
      { id: '1', reviewerName: 'Ana Rodríguez', reviewerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5c8?w=100&h=100&fit=crop&crop=face', rating: 5, comment: 'Excelente trabajo! Carlos superó todas mis expectativas con la cocina. Muy profesional y puntual.', projectTitle: 'Cocina moderna minimalista', createdAt: new Date(Date.now() - 604800000), isVerified: true },
      { id: '2', reviewerName: 'Luis Martínez', reviewerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', rating: 5, comment: 'Los muebles quedaron perfectos. Muy buena calidad de materiales y acabados impecables.', projectTitle: 'Muebles de sala a medida', createdAt: new Date(Date.now() - 1209600000), isVerified: true },
    ]
  });

  readonly specialtyIcons: { [key: string]: string } = {
    carpinteria: '🔨',
    ebanisteria: '🎨',
    restauracion: '✨'
  };

  onBack(): void {
    this.router.navigate(['/dashboard-client']);
  }
  onNavigate(screen: string, data?: any) { console.log(`Navigating to ${screen}`, data); }

  handleContactWorker() {
    this.onNavigate('chat', { 
      participant: this.worker(), 
      projectTitle: 'Consulta general' 
    });
  }

  toggleFavorite() {
    this.isFavorited.update(fav => !fav);
  }

  getSpecialtyName(id: string): string {
    const name = id.charAt(0).toUpperCase() + id.slice(1);
    return name;
  }
}
