import axios from 'axios';
import { Task, ApiResponse, TaskStatus } from './types';

const api = axios.create({
    baseURL: '/api/v1',
});

export const getTasks = async () => {
    const res = await api.get<ApiResponse<Task[]>>('/tasks');
    return res.data.data;
};

export const createTask = async (title: string, status: TaskStatus = 'todo') => {
    const res = await api.post<ApiResponse<Task>>('/tasks', { title, status });
    return res.data.data;
};

export const updateTask = async (id: string, updates: Partial<Task>) => {
    const res = await api.put<ApiResponse<Task>>(`/tasks/${id}`, updates);
    return res.data.data;
};

export const deleteTask = async (id: string) => {
    await api.delete(`/tasks/${id}`);
};
