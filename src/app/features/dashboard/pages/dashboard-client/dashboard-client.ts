
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Category, WorkerCard } from '../../models/dashboard';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard-client',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-client.html',
  styleUrls: ['./dashboard-client.scss']
})
export class DashboardClient implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  user$!: Observable<User | null>;

  isSidebarOpen = false;
  categories: Category[] = [
    { id: 'todos', name: 'Todos', count: 156 },
    { id: 'carpinteria', name: '🔨 Carpintería', count: 42 },
    { id: 'plomeria', name: '🔧 Plomería', count: 38 },
    { id: 'electricidad', name: '⚡ Electricidad', count: 29 },
    { id: 'albanileria', name: '🧱 Albañilería', count: 21 },
    { id: 'jardineria', name: '🌳 Jardinería', count: 15 },
    { id: 'pintura', name: '🎨 Pintura', count: 14 },
    { id: 'limpieza', name: '🧹 Limpieza', count: 11 },
  ];

  featuredWorkers: WorkerCard[] = [
    {
      id: '1',
      name: 'Alejandro García',
      specialty: 'Carpintero Profesional',
      rating: 4.9,
      reviewCount: 128,
      location: 'Ciudad de México',
      price: 450,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      coverImage: 'https://st4.depositphotos.com/26587216/28257/i/450/depositphotos_282571902-stock-photo-clouds-soft-pastel-colored-skies.jpg',
      isVerified: true,
      isOnline: true,
    },
    {
      id: '2',
      name: 'Mariana Rodríguez',
      specialty: 'Plomera Certificada',
      rating: 4.8,
      reviewCount: 94,
      location: 'Guadalajara, Jalisco',
      price: 480,
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      coverImage: 'https://media.istockphoto.com/id/1269463595/photo/watercolor-background-with-abstract-retro-sky-texture-in-pastel-colors.jpg?s=612x612&w=0&k=20&c=IU5VyrbFJ0WfGO-bsUPkG-GkuGA3yFcEqjv20038t8A=',
      isVerified: true,
      isOnline: false,
    },
    {
      id: '3',
      name: 'Carlos Sánchez',
      specialty: 'Electricista Industrial',
      rating: 5.0,
      reviewCount: 215,
      location: 'Monterrey, Nuevo León',
      price: 550,
      avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
      coverImage: 'https://st4.depositphotos.com/26587216/28257/i/450/depositphotos_282571902-stock-photo-clouds-soft-pastel-colored-skies.jpg',
      isVerified: true,
      isOnline: true,
    },
  ];

  activeCategory: string = 'todos';

  ngOnInit(): void {
    this.user$ = this.userService.currentUserProfile$;
  }

  async onLogout(): Promise<void> {
    try {
      await this.authService.signOut();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  setActiveCategory(categoryId: string) {
    this.activeCategory = categoryId;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
