import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';

interface Worker {
  id: string;
  name: string;
  age: number;
  specialty: string;
  rating: number;
  price: number;
  tagline: string;
  avatar: string;
  distance: string;
  isOnline: boolean;
  isVerified: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-worker-explorer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './worker-explorer.html',
  styleUrls: ['./worker-explorer.scss']
})
export class WorkerExplorerComponent implements OnInit {
  private firestore: Firestore = inject(Firestore);
  private router: Router = inject(Router);

  workers: Worker[] = [];
  currentIndex = 0;
  totalWorkers = 0;
  selectedCategory = 'todos';

  categories: Category[] = [
    { id: 'todos', name: 'Todos', icon: '🔍' },
    { id: 'plomeria', name: 'Plomería', icon: '🔧' },
    { id: 'electricidad', name: 'Electricidad', icon: '⚡' },
    { id: 'carpinteria', name: 'Carpintería', icon: '🔨' },
    { id: 'albanileria', name: 'Albañilería', icon: '🧱' },
    { id: 'pintura', name: 'Pintura', icon: '🎨' },
    { id: 'jardineria', name: 'Jardinería', icon: '🌳' },
    { id: 'limpieza', name: 'Limpieza', icon: '🧹' },
  ];

  // Animation state
  animationState: 'idle' | 'like' | 'dislike' = 'idle';

  // Swipe interaction state
  isDragging = false;
  startX = 0;
  translateX = 0;
  overlayOpacity = 0;
  feedbackColor = '';

  async ngOnInit() {
    await this.fetchWorkers();
  }

  async fetchWorkers(category: string = 'todos') {
    this.selectedCategory = category;
    const usersCollection = collection(this.firestore, 'users');
    let q = query(usersCollection, where('userType', '==', 'worker'));

    if (category !== 'todos') {
      q = query(q, where('oficios', 'array-contains', category));
    }

    const querySnapshot = await getDocs(q);
    this.workers = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data['displayName'] || 'Nombre no disponible',
        age: data['age'] || 28, // Mock age
        specialty: (data['oficios'] && data['oficios'][0]) || 'Especialidad no definida',
        rating: data['rating'] || 4.8, // Mock rating
        price: data['price'] || 400, // Mock price
        tagline: data['tagline'] || 'Comprometido con la calidad y el servicio.',
        avatar: data['photoURL'] || 'https://randomuser.me/api/portraits/men/1.jpg',
        distance: '3.5 km', // Mock distance
        isOnline: data['isOnline'] || true, // Mock status
        isVerified: data['isVerified'] || true, // Mock status
      };
    });
    this.totalWorkers = this.workers.length;
    this.currentIndex = 0;
  }

  selectCategory(categoryId: string) {
    this.fetchWorkers(categoryId);
  }

  triggerAction(action: 'like' | 'dislike') {
    this.animationState = action;
    console.log(`Worker ${this.workers[this.currentIndex].id}: ${action}`);

    // Wait for the animation to finish, then load the next worker
    setTimeout(() => {
      if (this.currentIndex < this.totalWorkers - 1) {
        this.currentIndex++;
      } else {
        console.log('No más trabajadores');
      }
      // Reset animation state for the new card
      this.animationState = 'idle';
      this.resetCardPosition();
    }, 500); // 500ms matches the animation duration
  }

  viewProfile() {
    if (this.workers.length > 0) {
      this.router.navigate(['/worker', this.workers[this.currentIndex].id]);
    }
  }

  goBack() {
    this.router.navigate(['/dashboard-client']);
  }

  // --- Dragging Logic ---
  onDragStart(event: MouseEvent | TouchEvent) {
    this.isDragging = true;
    this.startX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    event.preventDefault(); // Prevent default behavior like image dragging
  }

  onDragMove(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;

    const currentX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    this.translateX = currentX - this.startX;

    const threshold = 120;
    const percentage = Math.min(Math.abs(this.translateX) / threshold, 1);
    this.overlayOpacity = percentage * 0.8;

    if (this.translateX > 0) {
      this.feedbackColor = 'rgba(74, 222, 128, 1)'; // Green for like
    } else {
      this.feedbackColor = 'rgba(239, 68, 68, 1)'; // Red for dislike
    }
  }

  onDragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;

    const threshold = 120;
    if (Math.abs(this.translateX) > threshold) {
      if (this.translateX > 0) {
        this.triggerAction('like');
      } else {
        this.triggerAction('dislike');
      }
    } else {
      this.resetCardPosition();
    }
  }

  resetCardPosition() {
    this.translateX = 0;
    this.overlayOpacity = 0;
  }

  getCardStyle() {
    if (this.animationState !== 'idle') {
      return {}; // Let CSS handle the animation
    }
    const rotation = this.translateX / 20;
    return {
      transform: `translateX(${this.translateX}px) rotate(${rotation}deg)`,
      transition: this.isDragging ? 'none' : 'transform 0.3s ease-out'
    };
  }

  getOverlayStyle() {
    return {
      backgroundColor: this.feedbackColor,
      opacity: this.overlayOpacity,
      transition: 'opacity 0.3s ease-out'
    };
  }
}
