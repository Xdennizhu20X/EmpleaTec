import { ChangeDetectionStrategy, Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CloudinaryService } from '../../../../core/services/cloudinary.service';
import { User } from '../../../../core/models/user.model';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-my-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './my-profile-page.component.html',
  styleUrls: ['./my-profile-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyProfilePageComponent implements OnInit {
  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private cloudinaryService = inject(CloudinaryService);
  private cdr = inject(ChangeDetectorRef);

  user$!: Observable<User | null>;
  isEditing = signal(false);
  activeTab = signal('perfil');
  profileForm!: FormGroup;
  isUploading = signal(false);

  // Lista de oficios disponibles para el trabajador
  all_oficios = ['Carpintería', 'Plomería', 'Electricidad', 'Albañilería', 'Jardinería', 'Pintura', 'Limpieza'];

  ngOnInit(): void {
    this.user$ = this.userService.currentUserProfile$;
    this.user$.subscribe(user => {
      if (user) {
        this.buildForm(user);
      }
    });
  }

  buildForm(user: User): void {
    const oficiosFormArray = this.fb.array(
      this.all_oficios.map(oficio => 
        this.fb.control(user.oficios?.includes(oficio) || false)
      )
    );

    this.profileForm = this.fb.group({
      photoURL: [user.photoURL || ''],
      displayName: [user.displayName || ''],
      email: [{ value: user.email || '', disabled: true }],
      phone: [user.phone || ''],
      city: [user.city || ''],
      address: [user.address || ''],
      description: [user.description || ''],
    });

    if (user.userType === 'worker') {
      this.profileForm.addControl('experience', this.fb.control(user.experience || ''));
      this.profileForm.addControl('oficios', oficiosFormArray);
    }
  }

  get oficiosFormArray(): FormArray {
    return this.profileForm.get('oficios') as FormArray;
  }

  toggleEdit(user: User | null): void {
    if (!user) return;
    this.isEditing.update(editing => !editing);
    if (this.isEditing()) {
      this.buildForm(user); // Re-build form to reset state
    } 
  }

  selectTab(tab: string): void {
    this.activeTab.set(tab);
  }

  async onFileSelected(event: Event, user: User): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.isUploading.set(true);

    try {
      const response = await this.cloudinaryService.uploadImage(file, `avatars/${user.uid}`);
      this.profileForm.patchValue({ photoURL: response.secure_url });
      this.cdr.detectChanges(); // Manually trigger change detection
    } catch (error) {
      console.error('Error uploading image:', error);
      // Optionally show an error notification
    } finally {
      this.isUploading.set(false);
    }
  }

  async saveProfile(): Promise<void> {
    if (!this.profileForm.valid) return;

    this.user$.pipe(take(1)).subscribe(async user => {
      if (user) {
        try {
          const updatedData = this.profileForm.getRawValue();
          
          if (user.userType === 'worker') {
            updatedData.oficios = this.profileForm.value.oficios
              .map((checked: boolean, i: number) => checked ? this.all_oficios[i] : null)
              .filter((oficio: string | null) => oficio !== null);
          }

          await this.userService.updateUserProfile(user.uid, updatedData);
          this.isEditing.set(false);
        } catch (error) {
          console.error('Error updating profile:', error);
        }
      }
    });
  }

  async onLogout(): Promise<void> {
    try {
      await this.authService.signOut();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  formatDate(date: any): string {
    if (!date) return '';
    const jsDate = date.toDate ? date.toDate() : date;
    return formatDate(jsDate, 'dd/MM/yyyy', 'en-US');
  }

  goBack(): void {
    window.history.back();
  }
}
