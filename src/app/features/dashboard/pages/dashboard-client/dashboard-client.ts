
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
  featuredWorkers$!: Observable<User[]>;

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

  activeCategory: string = 'todos';

  ngOnInit(): void {
    this.user$ = this.userService.currentUserProfile$;
    this.featuredWorkers$ = this.userService.getWorkers();
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
