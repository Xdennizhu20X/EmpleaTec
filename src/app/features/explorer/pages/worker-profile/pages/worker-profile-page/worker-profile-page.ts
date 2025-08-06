import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Worker, PortfolioItem } from '../../models/worker-profile.model';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-worker-profile-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './worker-profile-page.html',
})
export class WorkerProfilePageComponent implements OnInit {
  private firestore: Firestore = inject(Firestore);
  private route: ActivatedRoute = inject(ActivatedRoute);

  worker$: Observable<Worker | undefined> | undefined;
  worker: Worker | undefined;

  activeTab: 'portfolio' | 'about' | 'reviews' = 'portfolio';
  selectedPortfolioItem: PortfolioItem | null = null;

  // Mapeo de íconos para especialidades
  specialtyIconMap: { [key: string]: string } = {
    'electricista': 'bolt',
    'plomero': 'wrench',
    'carpintero': 'wood',
    'albañil': 'brick-wall',
    'pintor': 'paint-brush',
    'jardinero': 'leaf',
    'fontanero': 'pipe',
    'cerrajero': 'key',
  };

  ngOnInit(): void {
    const workerId = this.route.snapshot.paramMap.get('id');
    if (workerId) {
      const workerDocRef = doc(this.firestore, `workers/${workerId}`);
      this.worker$ = docData(workerDocRef, { idField: 'id' }) as Observable<Worker | undefined>;
      this.worker$.subscribe(workerData => {
        if (workerData) {
          this.worker = {
            ...workerData,
            specialtyIcons: this.mapSpecialtiesToIcons(workerData.specialty || '')
          };
        }
      });
    }
  }

  mapSpecialtiesToIcons(specialty: string): string[] {
    // Asumiendo que las especialidades pueden venir como "plomero, electricista"
    const specialties = specialty.toLowerCase().split(',').map(s => s.trim());
    return specialties.map(s => this.specialtyIconMap[s] || 'briefcase').slice(0, 4); // Max 4 icons
  }

  openPortfolioModal(item: PortfolioItem): void {
    this.selectedPortfolioItem = item;
  }

  closePortfolioModal(): void {
    this.selectedPortfolioItem = null;
  }
}