import { lastValueFrom } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';
import { AuthService } from 'src/core/services/auth.service';
import { StorageService } from 'src/core/services/storage.service';
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
  selector: 'app-worker-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './worker-register.html',
  styleUrls: ['./worker-register.scss']
})
export class WorkerRegisterComponent implements OnInit {
  registerForm!: FormGroup;
  currentStep = 1;
  oficios: string[] = ['Carpintería', 'Albañilería', 'Plomería', 'Electricidad', 'Pintor', 'Jardinería', 'Limpieza', 'Soldadura', 'Cerrajería', 'Reparación de electrodomésticos', 'Otros'];
  selectedOficios: string[] = [];
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private storageService: StorageService, 
    public router: Router, 
    private firestore: Firestore
  ) { }

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

  async onRegister() {
    if (this.registerForm.invalid) {
      console.error('El formulario es inválido.');
      return;
    }

    const { personalInfo, contactInfo, professionalInfo, accountInfo } = this.registerForm.value;
    
    try {
      const userCredential = await this.authService.signUp(personalInfo.email, accountInfo.password);
      const user = userCredential.user;

      if (user) {
        let photoURL = '';
        if (this.selectedFile) {
          try {
            // Usamos lastValueFrom para convertir el Observable a Promise de forma segura
            photoURL = await lastValueFrom(this.storageService.uploadProfilePhoto(user.uid, this.selectedFile!));
          } catch (error) {
            console.error('Error al subir la imagen de perfil:', error);
            alert('No se pudo subir la imagen de perfil. El registro continuará sin ella.');
          }
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
          photoURL: photoURL,
          userType: 'worker',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          notifications: {
            newJobs: true,
            messages: true,
            reviews: true,
          },
        };

        const userRef = doc(this.firestore, `users/${user.uid}`);
        await setDoc(userRef, userProfile);

        alert('¡Registro exitoso!');
        this.router.navigate(['/dashboard-worker']);
      }
    } catch (error: any) {
      console.error('Error detallado durante el registro:', error);
      alert('Error al registrar: ' + error.message);
    }
  }
}
