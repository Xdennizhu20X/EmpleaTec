import { lastValueFrom, tap } from 'rxjs';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';
import { AuthService } from 'src/core/services/auth.service';
import { CloudinaryService } from 'src/core/services/cloudinary.service';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { HttpClientModule } from '@angular/common/http';

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
  imports: [RouterModule, ReactiveFormsModule, HttpClientModule],
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
  
  // Estados del componente
  isLoading = false;
  uploadProgress: number | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private cloudinaryService = inject(CloudinaryService);
  public router = inject(Router);
  private firestore = inject(Firestore);

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
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      this.errorMessage = 'Formato de imagen no válido. Use JPEG, PNG o GIF.';
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'La imagen es demasiado grande. Máximo 5MB.';
      return;
    }

    this.selectedFile = file;
    this.errorMessage = null;
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async onRegister(): Promise<void> {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Formulario inválido. Por favor, complete todos los campos requeridos.';
      return;
    }

    // Resetear mensajes
    this.errorMessage = null;
    this.successMessage = null;
    this.isLoading = true;

    const { personalInfo, contactInfo, professionalInfo, accountInfo } = this.registerForm.value;

    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await this.authService.signUp(personalInfo.email, accountInfo.password);
      const user = userCredential.user;

      if (!user) {
        throw new Error('No se pudo crear el usuario');
      }

      let photoURL = '';
      
      // 2. Subir imagen a Cloudinary si existe
      if (this.selectedFile) {
        try {
          this.uploadProgress = 0;

          const upload$ = this.cloudinaryService.uploadFile(this.selectedFile, 'worker-profiles')
            .pipe(
              tap(response => {
                if (response.progress) {
                  this.uploadProgress = response.progress;
                }
              })
            );

          const response = await lastValueFrom(upload$);
          
          if (response.error) {
            throw new Error(response.error);
          }
          
          if (!response.url) {
            throw new Error('No se obtuvo URL de la imagen');
          }
          
          photoURL = response.url;
        } catch (uploadError) {
          console.error('Error al subir imagen:', uploadError);
          throw new Error('Error al subir la imagen de perfil');
        } finally {
          this.uploadProgress = null;
        }
      }

      // 3. Crear perfil en Firestore
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

      // Éxito
      this.successMessage = '¡Registro completado con éxito!';
      this.isLoading = false;
      await this.router.navigate(['/dashboard-worker']);

    } catch (error: any) {
      this.isLoading = false;
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          this.errorMessage = 'Este correo electrónico ya está registrado.';
          break;
        case 'auth/weak-password':
          this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'El correo electrónico no es válido.';
          break;
        default:
          this.errorMessage = error.message || 'Ocurrió un error durante el registro.';
      }
      
      console.error('Registration error:', error);
    }
  }
}