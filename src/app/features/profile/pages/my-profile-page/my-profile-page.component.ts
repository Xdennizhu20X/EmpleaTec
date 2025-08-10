import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service'; // Importar AuthService
import { User } from '../../../../core/models/user.model';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-my-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './my-profile-page.component.html',
  styleUrls: ['./my-profile-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyProfilePageComponent implements OnInit {
  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(AuthService); // Inyectar AuthService
  private location = inject(Location);

  user$!: Observable<User | null>;

  ngOnInit(): void {
    this.user$ = this.userService.currentUserProfile$;
  }

  async onLogout(): Promise<void> {
    try {
      await this.authService.signOut();
      this.router.navigate(['/']); // Redirigir a la página de inicio
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
    this.location.back();
  }
}
