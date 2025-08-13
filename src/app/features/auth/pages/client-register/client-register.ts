import { Component, OnInit, inject } from '@angular/core';

import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from 'src/core/services/auth.service';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { CloudinaryService } from 'src/core/services/cloudinary.service';
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

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private firestore = inject(Firestore);
  private cloudinaryService = inject(CloudinaryService);
  private notificationService = inject(NotificationService); // Inyectar NotificationService

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
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async onRegister() {
    if (this.registerForm.invalid) {
        this.notificationService.showError('Por favor, completa todos los campos requeridos.');
        return;
    }
    const { email, password, fullName } = this.registerForm.value;
    try {
      const userCredential = await this.authService.signUp(email, password);
      const user = userCredential.user;

      if (user) {
        let photoURL = '';
        if (this.selectedFile) {
          const uploadResponse = await this.cloudinaryService.uploadImage(this.selectedFile);
          photoURL = uploadResponse.secure_url;
        }

        const userRef = doc(this.firestore, `users/${user.uid}`);
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: fullName,
          photoURL,
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
      }

      this.notificationService.showSuccess('¡Registro exitoso! Redirigiendo al dashboard...');
      this.router.navigate(['/dashboard-client']);
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            this.notificationService.showError('El correo electrónico ya está en uso.');
        } else {
            this.notificationService.showError('Error al registrar: ' + error.message);
        }
    }
  }
}

