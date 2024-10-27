import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Task } from '../models/task.model';
import { TASKS_ENDPOINT } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTasks();
  }

  private loadTasks(): void {
    this.http.get<any[]>(TASKS_ENDPOINT).pipe(
      map(todos => todos.map(todo => ({
        id: todo.id,
        title: todo.title,
        description: '',
        dueDate: new Date(),
        createdAt: new Date()
      }))),
      tap(tasks => this.tasksSubject.next(tasks))
    ).subscribe();
  }

  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  getTaskById(id: number): Observable<Task | undefined> {
    return this.tasks$.pipe(
      map(tasks => tasks.find(task => task.id === id))
    );
  }

  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${TASKS_ENDPOINT}/${task.id}`, task).pipe(
      tap(updatedTask => {
        const currentTasks = this.tasksSubject.value;
        const index = currentTasks.findIndex(t => t.id === updatedTask.id);
        if (index !== -1) {
          currentTasks[index] = updatedTask;
          this.tasksSubject.next([...currentTasks]);
        }
      })
    );
  }

  addTask(task: Omit<Task, 'id'>): Observable<Task> {
    const newTask = { ...task, id: Date.now(), createdAt: new Date() };
    return this.http.post<Task>(TASKS_ENDPOINT, newTask).pipe(
      tap(addedTask => {
        const currentTasks = this.tasksSubject.value;
        this.tasksSubject.next([addedTask, ...currentTasks]);
      })
    );
  }
  
  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${TASKS_ENDPOINT}/${id}`).pipe(
      tap(() => {
        const currentTasks = this.tasksSubject.value;
        this.tasksSubject.next(currentTasks.filter(task => task.id !== id));
      })
    );
  }
}