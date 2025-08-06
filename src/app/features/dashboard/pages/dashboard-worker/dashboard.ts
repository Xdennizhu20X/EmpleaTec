import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 

interface JobOffer {
  id: string;
  title: string;
  clientName: string;
  location: string;
  budget: number;
  category: string;
  clientAvatar: string;
  coverImage: string;
  isUrgent: boolean;
}

interface Specialty {
  id: string;
  name: string;
  jobCount: number;
}

@Component({
  selector: 'app-dashboard-worker',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardWorker {
  isSidebarOpen = false;
  specialties: Specialty[] = [
    { id: 'todos', name: 'Todos los Trabajos', jobCount: 89 },
    { id: 'carpinteria', name: '🔨 Carpintería', jobCount: 25 },
    { id: 'plomeria', name: '🔧 Plomería', jobCount: 18 },
    { id: 'electricidad', name: '⚡ Electricidad', jobCount: 15 },
    { id: 'albanileria', name: '🧱 Albañilería', jobCount: 12 },
    { id: 'pintura', name: '🎨 Pintura', jobCount: 10 },
    { id: 'jardineria', name: '🌳 Jardinería', jobCount: 9 },
    { id: 'limpieza', name: '🧹 Limpieza', jobCount: 6 },
  ];

  jobOffers: JobOffer[] = [
    {
      id: '1',
      title: 'Renovación de Cocina Integral',
      clientName: 'Laura Torres',
      location: 'Condesa, CDMX',
      budget: 18500,
      category: '🔨 Carpintería',
      clientAvatar: 'https://randomuser.me/api/portraits/women/75.jpg',
      coverImage: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      isUrgent: true,
    },
    {
      id: '2',
      title: 'Instalación de Sistema de Riego',
      clientName: 'Roberto Morales',
      location: 'Polanco, CDMX',
      budget: 7800,
      category: '🌳 Jardinería',
      clientAvatar: 'https://randomuser.me/api/portraits/men/75.jpg',
      coverImage: 'https://decoracaobrasil.com/wp-content/uploads/2022/11/manutenc%CC%A7a%CC%83o-de-jardim.jpg',
      isUrgent: false,
    },
    {
      id: '3',
      title: 'Reparación de Fugas en Baño Principal',
      clientName: 'Sofía Castro',
      location: 'Santa Fe, CDMX',
      budget: 4200,
      category: '🔧 Plomería',
      clientAvatar: 'https://randomuser.me/api/portraits/women/76.jpg',
      coverImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      isUrgent: true,
    },
  ];

  activeSpecialty: string = 'todos';

  setActiveSpecialty(specialtyId: string) {
    this.activeSpecialty = specialtyId;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}