import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/core/services/auth.service';

@Component({
  selector: 'app-worker-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './worker-login.html',
  styleUrl: './worker-login.scss'
})
export class WorkerLoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      try {
        await this.authService.signIn(email, password);
        alert('Inicio de sesión exitoso!');
        this.router.navigate(['/dashboard']); // Navigate to a dashboard or home page
      } catch (error: any) {
        alert('Error al iniciar sesión: ' + error.message);
      }
    }
  }
}