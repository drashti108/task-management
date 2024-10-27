import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode = false;
  taskId: number | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      dueDate: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.taskId = +params['id'];
        this.loadTask(this.taskId);
      }
    });
  }

  loadTask(id: number): void {
    this.taskService.getTaskById(id).subscribe(
      task => {
        if (task) {
          this.taskForm.patchValue(task);
        } else {
          this.snackBar.open('Task not found', 'Close', { duration: 3000 });
          this.router.navigate(['/tasks']);
        }
      },
      error => {
        this.snackBar.open('Error loading task', 'Close', { duration: 3000 });
        console.error('Error loading task', error);
      }
    );
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.isLoading = true;
      const task = this.taskForm.value;
      if (this.isEditMode && this.taskId) {
        task.id = this.taskId;
        this.taskService.updateTask(task).subscribe(
          () => {
            this.snackBar.open('Task updated successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/tasks']);
          },
          error => {
            this.snackBar.open('Error updating task', 'Close', { duration: 3000 });
            console.error('Error updating task', error);
          }
        ).add(() => this.isLoading = false);
      } else {
        this.taskService.addTask(task).subscribe(
          () => {
            this.snackBar.open('Task added successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/tasks']);
          },
          error => {
            this.snackBar.open('Error adding task', 'Close', { duration: 3000 });
            console.error('Error adding task', error);
          }
        ).add(() => this.isLoading = false);
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/tasks']);
  }
}