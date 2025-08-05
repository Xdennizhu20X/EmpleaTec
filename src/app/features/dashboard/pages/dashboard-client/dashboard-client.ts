
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Import RouterModule
import { Category, WorkerCard } from '../../models/dashboard';

@Component({
  selector: 'app-dashboard-client',
  standalone: true,
  imports: [CommonModule, RouterModule], // Add RouterModule here
  templateUrl: './dashboard-client.html',
  styleUrls: ['./dashboard-client.scss']
})
export class DashboardClient {
  categories: Category[] = [
    { id: 'todos', name: 'Todos', count: 156 },
    { id: 'carpinteria', name: 'Carpintería', count: 42 },
    { id: 'plomeria', name: 'Plomería', count: 38 },
    { id: 'electricidad', name: 'Electricidad', count: 29 },
    { id: 'albanileria', name: 'Albañilería', count: 21 },
    { id: 'jardineria', name: 'Jardinería', count: 15 },
    { id: 'pintura', name: 'Pintura', count: 11 },
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
      coverImage: 'https://images.unsplash.com/photo-1581092918056-0c7c13e53b1f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
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
      coverImage: 'https://images.unsplash.com/photo-1533750349088-249c262d6244?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
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
      coverImage: 'https://images.unsplash.com/photo-1617578948993-f9a56e7fee32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      isVerified: true,
      isOnline: true,
    },
  ];

  activeCategory: string = 'todos';

  setActiveCategory(categoryId: string) {
    this.activeCategory = categoryId;
  }
}
