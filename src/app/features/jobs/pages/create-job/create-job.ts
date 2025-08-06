import { ChangeDetectionStrategy, Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, Job, UrgencyLevel } from '../../models/job.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-job',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-job.html',
  styleUrls: ['./create-job.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateJobComponent {
  currentStep = signal(1);
  isSubmitting = signal(false);
  private router = inject(Router);

  formData = signal<Job>({
    title: '',
    category: '',
    description: '',
    location: '',
    budget: { min: null, max: null, type: 'fixed' },
    timeline: { start: '', end: '', urgency: 'normal' },
    requirements: '',
    images: [],
  });

  errors = signal<Record<string, string>>({});

  readonly categories: Category[] = [
    { id: 'carpinteria', name: 'Carpintería', icon: '🪵' },
    { id: 'plomeria', name: 'Plomería', icon: '🔧' },
    { id: 'electricidad', name: 'Electricidad', icon: '⚡️' },
    { id: 'pintura', name: 'Pintura', icon: '🎨' },
    { id: 'albanileria', name: 'Albañilería', icon: '🧱' },
    { id: 'jardineria', name: 'Jardinería', icon: '🌿' },
    { id: 'limpieza', name: 'Limpieza', icon: '🧼' },
    { id: 'otros', name: 'Otros', icon: '📄' },
  ];

  readonly urgencyLevels: UrgencyLevel[] = [
    { id: 'urgent', name: 'Urgente', description: 'Necesito que empiecen esta semana', color: 'bg-red-100 text-red-800 border-red-200' },
    { id: 'normal', name: 'Normal', description: 'Puedo esperar 1-2 semanas', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { id: 'flexible', name: 'Flexible', description: 'No tengo prisa, cuando esté disponible', color: 'bg-green-100 text-green-800 border-green-200' },
  ];

  // --- Lógica de Pasos ---
  nextStep(): void {
    if (this.validateStep(this.currentStep())) {
      this.currentStep.update(prev => Math.min(prev + 1, 4));
    }
  }

  prevStep(): void {
    this.currentStep.update(prev => Math.max(prev - 1, 1));
  }

  // --- Lógica del Formulario ---
  handleInputChange<T extends keyof Job>(field: T, value: Job[T]): void {
    this.formData.update(prev => ({ ...prev, [field]: value }));
    if (this.errors()[field]) {
      this.errors.update(err => ({ ...err, [field]: '' }));
    }
  }

  handleBudgetChange(field: 'min' | 'max' | 'type', value: any): void {
    this.formData.update(prev => ({
      ...prev,
      budget: { ...prev.budget, [field]: value },
    }));
    if (this.errors()['budget']) {
      this.errors.update(err => ({ ...err, budget: '' }));
    }
  }

  handleTimelineChange(field: 'start' | 'end' | 'urgency', value: any): void {
    this.formData.update(prev => ({
      ...prev,
      timeline: { ...prev.timeline, [field]: value },
    }));
    if (this.errors()['timeline']) {
      this.errors.update(err => ({ ...err, timeline: '' }));
    }
  }

  // --- Validación ---
  validateStep(step: number): boolean {
    const newErrors: Record<string, string> = {};
    const data = this.formData();

    switch (step) {
      case 1:
        if (!data.title.trim()) newErrors['title'] = 'El título es requerido';
        if (!data.category) newErrors['category'] = 'Selecciona una categoría';
        if (!data.description.trim()) newErrors['description'] = 'La descripción es requerida';
        break;
      case 2:
        if (!data.location.trim()) newErrors['location'] = 'La ubicación es requerida';
        if (data.budget.min === null || data.budget.max === null) {
          newErrors['budget'] = 'Define el rango de presupuesto';
        } else if (Number(data.budget.min) >= Number(data.budget.max)) {
          newErrors['budget'] = 'El presupuesto mínimo debe ser menor al máximo';
        }
        break;
      case 3:
        if (!data.timeline.start) newErrors['timeline'] = 'Selecciona una fecha de inicio';
        break;
    }

    this.errors.set(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // --- Envío ---
  handleSubmit(): void {
    if (!this.validateStep(this.currentStep())) return;

    this.isSubmitting.set(true);
    console.log('Enviando datos:', this.formData());

    setTimeout(() => {
      this.isSubmitting.set(false);
      console.log('Proyecto publicado con éxito');
      // Aquí se navegaría a otra pantalla, por ejemplo:
      // this.router.navigate(['/dashboard']);
    }, 2000);
  }

  // --- Métodos de Utilidad para la Plantilla ---
  getCategoryById(id: string): Category | undefined {
    return this.categories.find(c => c.id === id);
  }

  getUrgencyById(id: string): UrgencyLevel | undefined {
    return this.urgencyLevels.find(u => u.id === id);
  }

  onBack(): void {
    this.router.navigate(['/dashboard-client']);
  }
}
