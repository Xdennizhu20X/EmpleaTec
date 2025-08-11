import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JobService } from '../../services/job.service';
import { Job } from '../../models/job-card.model';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-detail.html',
  styleUrls: ['./job-detail.scss']
})
export class JobDetailComponent implements OnInit {
  job$!: Observable<Job>;

  private route = inject(ActivatedRoute);
  private jobService = inject(JobService);

  ngOnInit(): void {
    const jobId = this.route.snapshot.paramMap.get('id');
    if (jobId) {
      this.job$ = this.jobService.getJobById(jobId);
    }
  }
}

