import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDocs, collection, deleteDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-worker-explorer',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './worker-explorer.html',
  styleUrls: ['./worker-explorer.scss']
})
export class WorkerExplorerComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private router = inject(Router);
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private workersSubscription!: Subscription;

  // Filter-related properties
  private workers$!: Observable<User[]>;
  categories$!: Observable<any[]>;
  categoryFilter = new FormControl('todos');

  // UI state
  workers: User[] = [];
  likedWorkers: User[] = [];
  currentIndex = 0;
  totalWorkers = 0;
  animationState: 'idle' | 'like' | 'dislike' = 'idle';
  isDragging = false;
  startX = 0;
  translateX = 0;
  overlayOpacity = 0;
  feedbackColor = '';

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.animationState !== 'idle' || this.currentIndex >= this.totalWorkers) return;
    if (event.key === 'ArrowLeft') {
      this.triggerAction('dislike');
    }
    if (event.key === 'ArrowRight') {
      this.triggerAction('like');
    }
  }

  ngOnInit(): void {
    this.loadLikedWorkers();
    this.workers$ = this.userService.getWorkers();

    this.categories$ = this.workers$.pipe(
      map(workers => {
        const allOficios = workers.flatMap(worker => worker.oficios || []);
        const uniqueOficios = [...new Set(allOficios)];
        const categories = uniqueOficios.map(oficio => ({
          id: oficio,
          name: oficio,
          icon: this.getIconForOficio(oficio)
        }));
        categories.unshift({ id: 'todos', name: 'Todos', icon: '🔍' });
        return categories;
      })
    );

    const filteredWorkers$ = combineLatest([
      this.workers$,
      this.categoryFilter.valueChanges.pipe(startWith('todos'))
    ]).pipe(
      map(([workers, selectedCategory]) => {
        if (selectedCategory === 'todos' || !selectedCategory) return workers;
        return workers.filter(worker => worker.oficios?.includes(selectedCategory));
      })
    );

    this.workersSubscription = filteredWorkers$.subscribe(workers => {
      this.workers = workers;
      this.totalWorkers = this.workers.length;
      this.currentIndex = 0;
      this.resetCardPosition();
    });
  }

  ngOnDestroy(): void {
    this.workersSubscription?.unsubscribe();
  }

  async loadLikedWorkers() {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return;

    const likesCollectionRef = collection(this.firestore, `clients/${currentUser.uid}/likes`);
    const likesSnapshot = await getDocs(likesCollectionRef);
    const likedWorkerIds = likesSnapshot.docs.map(doc => doc.id);

    if (likedWorkerIds.length > 0) {
      // Assuming userService has a method to get multiple workers by their UIDs
      const likedWorkersInfo = await this.userService.getWorkersByIds(likedWorkerIds);
      this.likedWorkers = likedWorkersInfo;
    }
  }

  setActiveCategory(categoryId: string): void {
    this.categoryFilter.setValue(categoryId);
  }

  getIconForOficio(oficio: string): string {
    const iconMap: { [key: string]: string } = {
      'plomería': '🪠',
      'cerrajería': '🔑',
      'soldadura': '🧲',
      'electricidad': '⚡',
      'carpintería': '🪚',
      'albanileria': '🧱',
      'pintor': '🎨',
      'jardinería': '🌳',
      'limpieza': '🧹',
      'reparación de electrodomésticos': '🔧',
    };
    return iconMap[oficio.toLowerCase()] || '🧱';
  }

  triggerAction(action: 'like' | 'dislike') {
    if (this.animationState !== 'idle' || this.currentIndex >= this.totalWorkers) return;

    if (action === 'like') {
      const worker = this.workers[this.currentIndex];
      if (!this.likedWorkers.some(w => w.uid === worker.uid)) {
        this.likedWorkers.push(worker);
        this.persistLike(worker.uid);
      }
    }

    this.animationState = action;
    setTimeout(() => {
      this.currentIndex++;
      this.animationState = 'idle';
      this.resetCardPosition();
    }, 500);
  }

  async persistLike(workerUid: string) {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return;
    const likeDocRef = doc(this.firestore, `clients/${currentUser.uid}/likes/${workerUid}`);
    await setDoc(likeDocRef, { likedAt: new Date() });
  }

  viewProfile(workerUid?: string) {
    const uid = workerUid || this.workers[this.currentIndex]?.uid;
    if (uid) {
      this.router.navigate(['/worker', uid]);
    }
  }

  goBack() { this.router.navigate(['/dashboard-client']); }

  onDragStart(event: MouseEvent | TouchEvent) {
    if (this.animationState !== 'idle' || this.currentIndex >= this.totalWorkers) return;
    this.isDragging = true;
    this.startX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    event.preventDefault();
  }

  onDragMove(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;
    const currentX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    this.translateX = currentX - this.startX;
    const threshold = 120;
    this.overlayOpacity = Math.min(Math.abs(this.translateX) / threshold, 1) * 0.8;
    this.feedbackColor = this.translateX > 0 ? 'rgba(22, 163, 74, 1)' : 'rgba(220, 38, 38, 1)';
  }

  onDragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    const threshold = 120;
    if (Math.abs(this.translateX) > threshold) {
      this.triggerAction(this.translateX > 0 ? 'like' : 'dislike');
    } else {
      this.resetCardPosition();
    }
  }

  resetCardPosition() { this.translateX = 0; this.overlayOpacity = 0; }

  getCardStyle() {
    if (this.animationState !== 'idle') return {};
    const rotation = this.translateX / 20;
    return { transform: `translateX(${this.translateX}px) rotate(${rotation}deg)`, transition: this.isDragging ? 'none' : 'transform 0.3s ease-out' };
  }

  getOverlayStyle() {
    return { backgroundColor: this.feedbackColor, opacity: this.overlayOpacity, transition: 'opacity 0.3s ease-out' };
  }

  formatDate(date: any): string {
    if (!date) return '';
    const jsDate = date.toDate ? date.toDate() : date;
    return formatDate(jsDate, 'dd/MM/yyyy', 'en-US');
  }

  async removeLikedWorker(workerUid: string, event: Event) {
    event.stopPropagation();
    this.likedWorkers = this.likedWorkers.filter(w => w.uid !== workerUid);
    await this.unpersistLike(workerUid);
  }

  async unpersistLike(workerUid: string) {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return;
    const likeDocRef = doc(this.firestore, `clients/${currentUser.uid}/likes/${workerUid}`);
    await deleteDoc(likeDocRef);
  }
}