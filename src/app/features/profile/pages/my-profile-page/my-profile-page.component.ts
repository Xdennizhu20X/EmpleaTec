import { ChangeDetectionStrategy, Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CloudinaryService } from '../../../../core/services/cloudinary.service';
import { User } from '../../../../core/models/user.model';
import { Job } from '../../../jobs/models/job.model';
import { JobService } from '../../../jobs/services/job.service';
import { Observable, firstValueFrom } from 'rxjs';
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
  private jobService = inject(JobService);

  user$!: Observable<User | null>;
  isEditing = signal(false);
  isEditingPortfolio = signal(false);
  activeTab = signal('perfil');
  profileForm!: FormGroup;
  portfolioForm!: FormGroup;
  isUploading = signal(false);
  clientProjects = signal<Job[]>([]);

  all_oficios = ['Carpintería', 'Plomería', 'Electricidad', 'Albañilería', 'Jardinería', 'Pintura', 'Limpieza'];

  ngOnInit(): void {
    this.user$ = this.userService.currentUserProfile$;
    this.user$.subscribe(user => {
      if (user) {
        this.buildForm(user);
        if (user.userType === 'client') {
          this.jobService.getJobsByClientId(user.uid).subscribe(projects => {
            this.clientProjects.set(projects);
          });
        }
      }
    });
  }

  buildForm(user: User): void {
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
      this.profileForm.addControl('oficios', this.fb.array(
        this.all_oficios.map(oficio => this.fb.control(user.oficios?.includes(oficio) || false))
      ));
    }
  }

  // --- Profile Edit --- //
  toggleEdit(user: User | null): void {
    if (!user) return;
    this.isEditing.update(editing => !editing);
    if (this.isEditing()) {
      this.buildForm(user);
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

  // --- Portfolio Edit --- //
  toggleEditPortfolio(user: User | null): void {
    if (!user) return;
    this.isEditingPortfolio.update(editing => !editing);
    if (this.isEditingPortfolio()) {
      this.portfolioForm = this.fb.group({
        portfolio: this.fb.array(
          user.portfolio?.map(item => this.createPortfolioItem(item)) || []
        )
      });
    } 
  }

  get portfolioFormArray(): FormArray {
    return this.portfolioForm.get('portfolio') as FormArray;
  }

  createPortfolioItem(item?: { imageUrl: string; title?: string; description?: string }): FormGroup {
    return this.fb.group({
      imageUrl: [item?.imageUrl || ''],
      title: [item?.title || ''],
      description: [item?.description || ''],
    });
  }

  addPortfolioItem(): void {
    this.portfolioFormArray.push(this.createPortfolioItem());
  }

  removePortfolioItem(index: number): void {
    this.portfolioFormArray.removeAt(index);
  }

  async onPortfolioImageSelected(event: Event, index: number): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.isUploading.set(true);

    try {
      const user = await firstValueFrom(this.user$);
      if (!user) throw new Error('User not found');
      
      const response = await this.cloudinaryService.uploadImage(file, `portfolio/${user.uid}/${Date.now()}`);
      const portfolioItem = this.portfolioFormArray.at(index) as FormGroup;
      portfolioItem.patchValue({ imageUrl: response.secure_url });
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error uploading portfolio image:', error);
    } finally {
      this.isUploading.set(false);
    }
  }

  async savePortfolio(): Promise<void> {
    this.user$.pipe(take(1)).subscribe(async user => {
      if (user) {
        try {
          const portfolioData = this.portfolioForm.value.portfolio;
          await this.userService.updateUserProfile(user.uid, { portfolio: portfolioData });
          this.isEditingPortfolio.set(false);
        } catch (error) {
          console.error('Error updating portfolio:', error);
        }
      }
    });
  }

  // --- General Methods --- //
  get oficiosFormArray(): FormArray {
    return this.profileForm.get('oficios') as FormArray;
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
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      this.isUploading.set(false);
    }
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

  getStatusInfo(status: string) {
    switch (status) {
      case 'open':
        return { text: 'Abierto', color: 'bg-blue-100 text-blue-800' };
      case 'in_progress':
        return { text: 'En Progreso', color: 'bg-yellow-100 text-yellow-800' };
      case 'completed':
        return { text: 'Completado', color: 'bg-green-100 text-green-800' };
      case 'cancelled':
        return { text: 'Cancelado', color: 'bg-red-100 text-red-800' };
      default:
        return { text: 'Desconocido', color: 'bg-gray-100 text-gray-800' };
    }
  }

  handleViewProject(project: Job) {
    this.router.navigate(['/project-details', project.id]);
  }
}
