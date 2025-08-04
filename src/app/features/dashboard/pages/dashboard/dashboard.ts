
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// --- Interfaces ---
interface User {
  name: string;
  userType: 'client' | 'worker';
  profileImage: string;
  specialties?: string[];
  completedJobs?: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface Worker {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  location: string;
  avatar: string;
  coverImage: string;
  price: string;
  isVerified: boolean;
  isOnline: boolean;
  completedJobs: number;
  yearsExperience: number;
  specialties: string[];
  bio: string;
  portfolio: PortfolioItem[];
}

interface PortfolioItem {
  id: string;
  title: string;
  image: string;
  description: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: { min: number; max: number };
  location: string;
  timeline: { urgency: 'normal' | 'urgent' | 'flexible'; start: string };
  deadline: string;
  applicants: number;
  client: {
    name: string;
    avatar: string;
    rating: number;
  };
  images: string[];
  requiresPortfolio: boolean;
  postedDate: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard {
  @Input() user: User = {
    name: 'Dennis',
    userType: 'worker', // o 'client' para probar
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    specialties: ['carpinteria', 'electricidad'],
    completedJobs: 127
  };
  @Output() onNavigate = new EventEmitter<{ screen: string, data?: any }>();
  @Output() onLogout = new EventEmitter<void>();

  searchQuery = '';
  selectedCategory = 'todos';

  categories: Category[] = [
    { id: 'todos', name: 'Todos', icon: '', count: 156 },
    { id: 'carpinteria', name: 'Carpintería', icon: '🔨', count: 42 },
    { id: 'plomeria', name: 'Plomería', icon: '💧', count: 38 },
    { id: 'electricidad', name: 'Electricidad', icon: '⚡', count: 29 },
    { id: 'pintura', name: 'Pintura', icon: '🎨', count: 24 },
    { id: 'jardineria', name: 'Jardinería', icon: '🌳', count: 23 }
  ];

  featuredWorkers: Worker[] = [
    {
      id: '1',
      name: 'Carlos Mendoza',
      specialty: 'Carpintería',
      rating: 4.9,
      reviewCount: 127,
      location: 'Polanco, CDMX',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      coverImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=200&fit=crop',
      price: '$450/día',
      isVerified: true,
      isOnline: true,
      completedJobs: 156,
      yearsExperience: 12,
      specialties: ['carpinteria'],
      bio: 'Carpintero profesional con más de 12 años de experiencia...',
      portfolio: []
    },
    {
      id: '2',
      name: 'María López',
      specialty: 'Plomería',
      rating: 4.8,
      reviewCount: 89,
      location: 'Roma Norte, CDMX',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5c8?w=150&h=150&fit=crop&crop=face',
      coverImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=200&fit=crop',
      price: '$380/día',
      isVerified: true,
      isOnline: false,
      completedJobs: 134,
      yearsExperience: 8,
      specialties: ['plomeria'],
      bio: 'Especialista en plomería residencial y comercial...',
      portfolio: []
    },
    {
      id: '3',
      name: 'Roberto Silva',
      specialty: 'Electricidad',
      rating: 4.7,
      reviewCount: 156,
      location: 'Condesa, CDMX',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      coverImage: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=200&fit=crop',
      price: '$420/día',
      isVerified: true,
      isOnline: true,
      completedJobs: 203,
      yearsExperience: 15,
      specialties: ['electricidad'],
      bio: 'Electricista certificado con amplia experiencia...',
      portfolio: []
    }
  ];

  recentProjects: Project[] = [
    {
      id: '1',
      title: 'Renovación de cocina integral',
      description: 'Proyecto completo de renovación de cocina...',
      category: 'carpinteria',
      budget: { min: 15000, max: 25000 },
      location: 'Santa Fe, CDMX',
      timeline: { urgency: 'normal', start: '2024-05-01' },
      deadline: '2 semanas',
      applicants: 8,
      client: { name: 'Ana Rodríguez', avatar: '...', rating: 4.8 },
      images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop'],
      requiresPortfolio: true,
      postedDate: new Date(Date.now() - 86400000 * 2)
    },
    {
      id: '2',
      title: 'Reparación sistema eléctrico',
      description: 'Reparación y actualización del sistema eléctrico...',
      category: 'electricidad',
      budget: { min: 5000, max: 8000 },
      location: 'Del Valle, CDMX',
      timeline: { urgency: 'urgent', start: '2024-04-28' },
      deadline: '1 semana',
      applicants: 12,
      client: { name: 'Luis Martínez', avatar: '...', rating: 4.9 },
      images: ['https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=300&fit=crop'],
      requiresPortfolio: false,
      postedDate: new Date(Date.now() - 86400000)
    },
    {
      id: '3',
      title: 'Instalación de pisos de madera',
      description: 'Instalación completa de pisos de madera...',
      category: 'carpinteria',
      budget: { min: 8000, max: 12000 },
      location: 'Polanco, CDMX',
      timeline: { urgency: 'flexible', start: '2024-05-10' },
      deadline: '3 semanas',
      applicants: 15,
      client: { name: 'Carmen López', avatar: '...', rating: 4.7 },
      images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop'],
      requiresPortfolio: true,
      postedDate: new Date(Date.now() - 86400000 * 3)
    }
  ];

  get filteredProjects(): Project[] {
    if (this.user?.userType === 'worker') {
      return this.recentProjects.filter(project =>
        this.user.specialties?.includes(project.category) ||
        (this.user.specialties?.length === 0)
      );
    }
    return this.recentProjects;
  }

  handleContactWorker(worker: Worker): void {
    this.onNavigate.emit({
      screen: 'chat',
      data: {
        participant: worker,
        projectTitle: 'Consulta general'
      }
    });
  }

  handleViewWorkerProfile(worker: Worker): void {
    this.onNavigate.emit({ screen: 'worker-profile', data: worker });
  }

  handleViewProject(project: Project): void {
    const projectData = {
      ...project,
      status: 'open',
      distance: 2.5 // Mock distance
    };

    if (this.user?.userType === 'worker') {
      this.onNavigate.emit({ screen: 'jobs-explorer', data: { highlightProject: project.id } });
    } else {
      this.onNavigate.emit({ screen: 'job-applications', data: projectData });
    }
  }

  getUrgencyClass(urgency: string): string {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'flexible': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getUrgencyText(urgency: string): string {
    switch (urgency) {
      case 'urgent': return 'Urgente';
      case 'normal': return 'Normal';
      case 'flexible': return 'Flexible';
      default: return 'Normal';
    }
  }

  getSpecialtyName(id: string): string {
    const specialty = this.categories.find(c => c.id === id);
    return specialty ? specialty.name : id;
  }
}
