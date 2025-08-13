import { ChangeDetectionStrategy, Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, Job, UrgencyLevel } from '../../models/job.model';
import { Router } from '@angular/router';
import { Firestore, addDoc, collection, serverTimestamp } from '@angular/fire/firestore';
import { AuthService } from '../../../../core/services/auth.service';
import { firstValueFrom } from 'rxjs';
import { CloudinaryService } from '../../../../core/services/cloudinary.service';
import { NotificationService } from '../../../../core/services/notification.service';

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
  isUploadingImages = signal(false);
  uploadProgress = signal<number | null>(null);
  private router = inject(Router);
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private cloudinaryService = inject(CloudinaryService);
  private notificationService = inject(NotificationService);
  isDragging = signal(false);
  uploadError = signal<string | null>(null);

  formData = signal<Job>({
    id: '',
    clientId: '',
    clientName: '',
    title: '',
    category: '',
    description: '',
    location: '',
    budget: { min: null, max: null, type: 'fixed' },
    timeline: { start: '', end: '', urgency: 'normal' },
    requirements: '',
    images: [],
    createdAt: null,
    status: 'open',
  });

  errors = signal<Record<string, string>>({});
  selectedFiles = signal<File[]>([]);
  previewUrls = signal<string[]>([]);

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

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  

  // --- Manejo de imágenes ---
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      
      // Validar cantidad de imágenes (ejemplo: máximo 5)
      if (this.selectedFiles().length + files.length > 5) {
        this.errors.update(err => ({...err, images: 'Máximo 5 imágenes permitidas'}));
        return;
      }
      
      // Validar tipos de archivo y tamaño
      const validFiles = files.filter(file => {
        const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        
        if (!isValidType) {
          this.errors.update(err => ({...err, images: 'Solo se permiten imágenes JPEG, PNG o GIF'}));
        } else if (!isValidSize) {
          this.errors.update(err => ({...err, images: 'Las imágenes no deben superar los 5MB'}));
        }
        
        return isValidType && isValidSize;
      });
      
      if (validFiles.length === 0) return;
      
      this.selectedFiles.update(prev => [...prev, ...validFiles]);
      this.generatePreviews(validFiles);
      this.errors.update(err => ({...err, images: ''}));
    }
  }
  

  private generatePreviews(files: File[]): void {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.previewUrls.update(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  private handleFiles(files: FileList): void {
    const fileArray = Array.from(files);
    
    // Validaciones
    if (this.selectedFiles().length + fileArray.length > 5) {
      this.uploadError.set('Máximo 5 imágenes permitidas');
      return;
    }

    const validFiles = fileArray.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        this.uploadError.set('Solo se permiten imágenes JPEG, PNG, GIF o WebP');
      } else if (!isValidSize) {
        this.uploadError.set('Cada imagen no debe superar los 5MB');
      }
      
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;
    
    this.selectedFiles.update(prev => [...prev, ...validFiles]);
    this.generatePreviews(validFiles);
    this.uploadError.set(null);
  }

  removeImage(index: number): void {
    this.selectedFiles.update(prev => prev.filter((_, i) => i !== index));
    this.previewUrls.update(prev => prev.filter((_, i) => i !== index));
  }

  async uploadImages(): Promise<string[]> {
    if (this.selectedFiles().length === 0) return [];
    
    this.isUploadingImages.set(true);
    this.uploadProgress.set(0);
    
    try {
      const uploadedUrls: string[] = [];
      const totalFiles = this.selectedFiles().length;
      let completedFiles = 0;
      
      // Subir imágenes una por una para mejor manejo de errores
      for (const file of this.selectedFiles()) {
        try {
          const result = await this.cloudinaryService.uploadImage(file, 'job_images');
          uploadedUrls.push(result.secure_url);
          completedFiles++;
          this.uploadProgress.set(Math.round((completedFiles / totalFiles) * 100));
        } catch (error) {
          console.error('Error uploading image:', error);
          // Continuar con las siguientes imágenes aunque falle una
        }
      }
      
      return uploadedUrls;
    } finally {
      this.isUploadingImages.set(false);
      this.uploadProgress.set(null);
    }
  }

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
  async handleSubmit(): Promise<void> {
    if (!this.validateStep(4)) return;

    this.isSubmitting.set(true);

    try {
      // 1. Subir imágenes primero
      const imageUrls = await this.uploadImages();
      
      // 2. Obtener información del usuario
      const userProfile = await firstValueFrom(this.authService.getUserProfile());
      if (!userProfile) {
        alert('Error: Debes iniciar sesión para poder publicar un proyecto.');
        this.isSubmitting.set(false);
        this.router.navigate(['/login-client']);
        return;
      }

      // 3. Crear el objeto del trabajo con las URLs de las imágenes
      const jobData = {
        ...this.formData(),
        images: imageUrls,
        clientId: userProfile.uid,
        clientName: userProfile.displayName,
        createdAt: serverTimestamp(),
        status: 'open',
      };

      // 4. Guardar en Firestore
      const docRef = await addDoc(collection(this.firestore, 'jobs'), jobData);
      console.log('Proyecto publicado con éxito. ID:', docRef.id);
      
      this.notificationService.showSuccess('¡Trabajo creado con éxito!');
      this.isSubmitting.set(false);
      this.router.navigate(['/dashboard-client']);
    } catch (error) { 
      console.error('Error al publicar el proyecto:', error);
      alert('Ocurrió un error al publicar el proyecto. Por favor, inténtalo de nuevo.');
      this.isSubmitting.set(false);
    }
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