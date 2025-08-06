  import { lastValueFrom, tap } from 'rxjs';
  import { Component, OnInit, inject } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { RouterModule, Router } from '@angular/router';
  import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';
  import { AuthService } from 'src/core/services/auth.service';
  import { CloudinaryService, CloudinaryUploadResponse } from 'src/core/services/cloudinary.service';
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
      this.selectedFile = event.target.files[0];
    }

  async onRegister(): Promise<void> {
    if (this.registerForm.invalid) {
      console.error('Formulario inválido. Por favor, complete todos los campos requeridos.');
      return;
    }

    const { personalInfo, contactInfo, professionalInfo, accountInfo } = this.registerForm.value;
    
    try {
      // 1. Registrar usuario en Firebase Auth
      const userCredential = await this.authService.signUp(personalInfo.email, accountInfo.password);
      const user = userCredential.user;

      if (!user) {
        throw new Error('No se pudo crear el usuario');
      }

      // 2. Subir imagen a Cloudinary (si existe)
      let photoURL = '';
      if (this.selectedFile) {
        try {
          const uploadResult: CloudinaryUploadResponse = await lastValueFrom(
            this.cloudinaryService.uploadFile(this.selectedFile, 'profile_photos').pipe(
              tap((response: CloudinaryUploadResponse) => {
                if (response.progress) {
                  console.log(`Progreso de carga: ${response.progress}%`);
                }
              })
            )
          );

          if (uploadResult.error) {
            console.warn('Advertencia en carga de imagen:', uploadResult.error);
          } else {
            photoURL = uploadResult.url || '';
          }
        } catch (uploadError: unknown) {
          console.error('Error en carga de imagen:', uploadError);
          // Continuar sin imagen (photoURL permanece como string vacío)
        }
      }

      // 3. Preparar datos del perfil
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

      // 4. Guardar en Firestore
      const userRef = doc(this.firestore, `users/${user.uid}`);
      await setDoc(userRef, userProfile);

      // 5. Feedback al usuario y navegación
      this.showSuccessAlert('¡Registro completado con éxito!');
      await this.router.navigate(['/dashboard-worker']);
      
    } catch (error: unknown) {
      console.error('Error durante el registro:', error);
      this.handleRegistrationError(error);
    }
  }

  private showSuccessAlert(message: string): void {
    alert(message);
  }

  private handleRegistrationError(error: unknown): void {
    let errorMessage = 'Ocurrió un error durante el registro.';
    
    if (error instanceof Error && 'code' in error) {
      const firebaseError = error as { code: string };
      switch (firebaseError.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este correo electrónico ya está registrado.';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
          break;
        // Agrega más casos según necesites
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    alert(errorMessage);
  }
  }
