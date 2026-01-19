export type TaskStatus = 'todo' | 'doing' | 'done';

export interface Task {
    id: string;
    title: string;
    content?: string;
    status: TaskStatus;
    position: number;
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}
