import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from 'src/core/services/auth.service';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

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
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './client-register.html',
  styleUrl: './client-register.scss'
})
export class ClientRegisterComponent implements OnInit {
  registerForm!: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private firestore: Firestore) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  async onRegister() {
    if (this.registerForm.valid) {
      const { email, password, fullName } = this.registerForm.value;
      try {
        const userCredential = await this.authService.signUp(email, password);
        const user = userCredential.user;

        if (user) {
          const userRef = doc(this.firestore, `users/${user.uid}`);
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: fullName,
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

        alert('Registro exitoso!');
        this.router.navigate(['/login-client']); // Navigate to login page after registration
      } catch (error: any) {
        alert('Error al registrar: ' + error.message);
      }
    }
  }
}