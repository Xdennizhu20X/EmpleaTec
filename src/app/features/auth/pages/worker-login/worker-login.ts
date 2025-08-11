import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-worker-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './worker-login.html',
  styleUrl: './worker-login.scss'
})
export class WorkerLoginComponent implements OnInit {
  loginForm!: FormGroup;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      this.notificationService.showError('Por favor, ingresa un correo y contraseña válidos.');
      return;
    }

    const { email, password } = this.loginForm.value;
    try {
      const userCredential = await this.authService.signIn(email, password);
      const uid = userCredential.user.uid;

      this.userService.getUserById(uid).subscribe((user: User | null) => {
        if (user) {
          this.notificationService.showSuccess('Inicio de sesión exitoso!');
          if (user.userType === 'worker') {
            this.router.navigate(['/dashboard-worker']);
          } else if (user.userType === 'client') {
            this.router.navigate(['/dashboard-client']);
          } else {
            this.notificationService.showError('Tipo de usuario no reconocido.');
            this.router.navigate(['/']);
          }
        } else {
          this.notificationService.showError('No se pudo encontrar el perfil de usuario.');
          this.authService.signOut();
        }
      });
    } catch (error: any) {
      let errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Correo o contraseña incorrectos.';
      }
      this.notificationService.showError(errorMessage);
    }
  }
}
