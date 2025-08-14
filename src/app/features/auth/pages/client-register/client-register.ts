import { Component, OnInit, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from 'src/core/services/auth.service';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { CloudinaryService } from 'src/core/services/cloudinary.service';
import { lastValueFrom } from 'rxjs';

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-client-register',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './client-register.html',
  styleUrls: ['./client-register.scss']
})
export class ClientRegisterComponent implements OnInit {
  registerForm!: FormGroup;
  selectedFile: File | null = null;
  selectedImage: string | null = null;
  
  // Estados del componente
  isLoading = false;
  uploadProgress: number | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private firestore = inject(Firestore);
  private cloudinaryService = inject(CloudinaryService);

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      profilePicture: [null]
    }, { validators: passwordMatchValidator });
  }

  onFileSelected(event: any): void {
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

  async onRegister() {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos requeridos.';
      return;
    }

    // Resetear mensajes
    this.errorMessage = null;
    this.successMessage = null;
    this.isLoading = true;

    const { email, password, fullName } = this.registerForm.value;

    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await this.authService.signUp(email, password);
      const user = userCredential.user;

      if (!user) {
        throw new Error('No se pudo crear el usuario');
      }

      let photoURL = '';
      
      // 2. Subir imagen a Cloudinary si existe
      if (this.selectedFile) {
        try {
          this.uploadProgress = 0;

          const uploadResponse = await lastValueFrom(
            this.cloudinaryService.uploadFile(this.selectedFile, 'client-profiles')
          );
          
          if (uploadResponse.error) {
            throw new Error(uploadResponse.error);
          }
          
          if (!uploadResponse.url) {
            throw new Error('No se obtuvo URL de la imagen');
          }
          
          photoURL = uploadResponse.url;
        } catch (uploadError) {
          console.error('Error al subir imagen:', uploadError);
          throw new Error('Error al subir la imagen de perfil');
        } finally {
          this.uploadProgress = null;
        }
      }

      // 3. Crear perfil en Firestore
      const userRef = doc(this.firestore, `users/${user.uid}`);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: fullName,
        photoURL: photoURL || null,
        userType: 'client',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        notifications: {
          newJobs: true,
          messages: true,
          reviews: true,
        },
      });

      // Éxito
      this.successMessage = '¡Registro exitoso! Redirigiendo al dashboard...';
      this.isLoading = false;
      await this.router.navigate(['/dashboard-client']);

    } catch (error: any) {
      this.isLoading = false;
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          this.errorMessage = 'El correo electrónico ya está en uso.';
          break;
        case 'auth/weak-password':
          this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
          break;
        default:
          this.errorMessage = error.message || 'Error al registrar. Por favor, inténtalo nuevamente.';
      }
      
      console.error('Registration error:', error);
    }
  }
}