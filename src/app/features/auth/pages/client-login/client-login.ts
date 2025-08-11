import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/core/services/auth.service';
import { NotificationService } from 'src/core/services/notification.service';

@Component({
  selector: 'app-client-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './client-login.html',
  styleUrls: ['./client-login.scss']
})
export class ClientLoginComponent implements OnInit {
  loginForm!: FormGroup;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      this.notificationService.showError('Por favor, ingresa un correo y contraseña válidos.');
      return;
    }

    const { email, password } = this.loginForm.value;
    try {
      await this.authService.signIn(email, password);
      this.notificationService.showSuccess('Inicio de sesión exitoso!');
      this.router.navigate(['/dashboard-client']);
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
