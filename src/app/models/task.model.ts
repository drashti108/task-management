export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate: Date;
  createdAt: Date;
}