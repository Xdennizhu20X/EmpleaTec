import { lastValueFrom, tap } from 'rxjs';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';
import { AuthService } from 'src/core/services/auth.service';
import { CloudinaryService, CloudinaryUploadResponse } from 'src/core/services/cloudinary.service';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { HttpClientModule } from '@angular/common/http';
import { NotificationService } from 'src/core/services/notification.service'; // Importar NotificationService

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-worker-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './worker-register.html',
  styleUrls: ['./worker-register.scss']
})
export class WorkerRegisterComponent implements OnInit {
  registerForm!: FormGroup;
  currentStep = 1;
  oficios: string[] = ['Carpintería', 'Albañilería', 'Plomería', 'Electricidad', 'Pintor', 'Jardinería', 'Limpieza', 'Soldadura', 'Cerrajería', 'Reparación de electrodomésticos', 'Otros'];
  selectedOficios: string[] = [];
  selectedFile: File | null = null;
  selectedImage: string | null = null;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private cloudinaryService = inject(CloudinaryService);
  public router = inject(Router);
  private firestore = inject(Firestore);
  private notificationService = inject(NotificationService); // Inyectar NotificationService

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      personalInfo: this.fb.group({
        fullName: ['', Validators.required],
        cedula: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]]
      }),
      contactInfo: this.fb.group({
        phone: ['', Validators.required],
        city: ['', Validators.required],
        address: ['', Validators.required]
      }),
      professionalInfo: this.fb.group({
        oficios: this.fb.array([], Validators.required),
        experience: ['', Validators.required]
      }),
      accountInfo: this.fb.group({
        photo: [null],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      }, { validators: passwordMatchValidator })
    });
  }

  handleBackNavigation() {
    if (this.currentStep === 1) {
      this.router.navigate(['/']);
    } else {
      this.prevStep();
    }
  }

  nextStep() {
    if (this.currentStep === 1 && this.registerForm.get('personalInfo')?.valid) {
      this.currentStep++;
    } else if (this.currentStep === 2 && this.registerForm.get('contactInfo')?.valid) {
      this.currentStep++;
    } else if (this.currentStep === 3 && this.registerForm.get('professionalInfo')?.valid) {
      this.currentStep++;
    }
  }

  prevStep() {
    this.currentStep--;
  }

  onOficioChange(event: any) {
    const oficiosArray = this.registerForm.get('professionalInfo.oficios') as FormArray;

    if (event.target.checked) {
      oficiosArray.push(this.fb.control(event.target.value));
      this.selectedOficios.push(event.target.value);
    } else {
      const index = oficiosArray.controls.findIndex(x => x.value === event.target.value);
      oficiosArray.removeAt(index);
      this.selectedOficios = this.selectedOficios.filter(o => o !== event.target.value);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async onRegister(): Promise<void> {
    if (this.registerForm.invalid) {
      this.notificationService.showError('Formulario inválido. Por favor, complete todos los campos requeridos.');
      return;
    }

    const { personalInfo, contactInfo, professionalInfo, accountInfo } = this.registerForm.value;

    try {
      const userCredential = await this.authService.signUp(personalInfo.email, accountInfo.password);
      const user = userCredential.user;

      if (!user) {
        throw new Error('No se pudo crear el usuario');
      }

      let photoURL = '';
      if (this.selectedFile) {
        // ... (lógica de carga de imagen sin cambios)
      }

      const userProfile = {
        uid: user.uid,
        email: personalInfo.email,
        displayName: personalInfo.fullName,
        cedula: personalInfo.cedula,
        phone: contactInfo.phone,
        city: contactInfo.city,
        address: contactInfo.address,
        oficios: professionalInfo.oficios,
        experience: professionalInfo.experience,
        photoURL: photoURL || null,
        userType: 'worker',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        notifications: {
          newJobs: true,
          messages: true,
          reviews: true,
        },
        registrationCompleted: true,
        lastLogin: new Date()
      };

      const userRef = doc(this.firestore, `users/${user.uid}`);
      await setDoc(userRef, userProfile);

      this.notificationService.showSuccess('¡Registro completado con éxito!');
      await this.router.navigate(['/dashboard-worker']);

    } catch (error: any) {
      let errorMessage = 'Ocurrió un error durante el registro.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo electrónico ya está registrado.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      }
      this.notificationService.showError(errorMessage);
    }
  }
}
