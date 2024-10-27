import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { compare } from '../../utils';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  displayedColumns: string[] = ['title', 'description', 'dueDate', 'actions'];
  dataSource: Task[] = [];
  filteredTasks$: Observable<Task[]>;
  searchTerm$ = new BehaviorSubject<string>('');
  pageSize = 5;
  pageIndex = 0;
  totalTasks = 0;
  isLoading = true;

  constructor(private taskService: TaskService, private snackBar: MatSnackBar) {
    this.filteredTasks$ = combineLatest([
      this.taskService.getTasks(),
      this.searchTerm$
    ]).pipe(
      map(([tasks, searchTerm]) => 
        tasks.filter(task => 
          task.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.filteredTasks$.subscribe(tasks => {
      this.dataSource = tasks.slice(this.pageIndex * this.pageSize, (this.pageIndex + 1) * this.pageSize);
      this.totalTasks = tasks.length;
      this.isLoading = false;
    });
  }

  onSearch(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.searchTerm$.next(searchValue);
    this.pageIndex = 0;
    this.loadTasks();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTasks();
  }

  onSort(sort: Sort): void {
    this.filteredTasks$ = this.filteredTasks$.pipe(
      map(tasks => [...tasks].sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'title': return compare(a.title, b.title, isAsc);
          case 'dueDate': return compare(a.dueDate, b.dueDate, isAsc);
          default: return 0;
        }
      }))
    );
    this.loadTasks();
  }

  deleteTask(id: number): void {
    this.isLoading = true;
    this.taskService.deleteTask(id).subscribe(
      () => {
        this.snackBar.open('Task deleted successfully', 'Close', { duration: 3000 });
        this.loadTasks();
      },
      error => {
        this.snackBar.open('Error deleting task', 'Close', { duration: 3000 });
        console.error('Error deleting task', error);
      }
    ).add(() => this.isLoading = false);
  }
}
