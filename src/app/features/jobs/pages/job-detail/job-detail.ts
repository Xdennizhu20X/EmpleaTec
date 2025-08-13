import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JobService } from '../../services/job.service';
import { Job } from '../../models/job.model';
import { Observable, firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './job-detail.html',
  styleUrls: ['./job-detail.scss']
})
export class JobDetailComponent implements OnInit {
  job$!: Observable<Job>;
  showApplicationForm = false;
  applicationForm: FormGroup;

  private route = inject(ActivatedRoute);
  private jobService = inject(JobService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  constructor() {
    this.applicationForm = this.fb.group({
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const jobId = this.route.snapshot.paramMap.get('id');
    if (jobId) {
      this.job$ = this.jobService.getJobById(jobId);
    }
  }

  toggleApplicationForm(): void {
    this.showApplicationForm = !this.showApplicationForm;
  }

  async submitApplication(): Promise<void> {
    console.log('Submitting application...');
    if (this.applicationForm.invalid) {
      console.log('Application form is invalid');
      return;
    }

    const jobId = this.route.snapshot.paramMap.get('id');
    console.log('Job ID:', jobId);

    try {
      const currentUser = await firstValueFrom(this.authService.getCurrentUser());
      console.log('Current user:', currentUser);

      if (jobId && currentUser) {
        const application = {
          applicantId: currentUser.uid,
          description: this.applicationForm.value.description
        };
        console.log('Application data:', application);

        await this.jobService.applyToJob(jobId, application);
        console.log('Application submitted successfully');

        this.toggleApplicationForm();
        this.applicationForm.reset();
        // Optionally, show a success message
      } else {
        console.log('Job ID or current user is missing');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      // Optionally, show an error message
    }
  }
}

