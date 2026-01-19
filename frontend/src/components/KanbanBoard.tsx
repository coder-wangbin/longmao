import { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
    useSensor,
    useSensors,
    PointerSensor,
    closestCorners
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';

import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus } from '../types';
import { getTasks, createTask, updateTask, deleteTask } from '../api';

const COLUMNS: { id: TaskStatus; title: string }[] = [
    { id: 'todo', title: '待处理' },
    { id: 'doing', title: '进行中' },
    { id: 'done', title: '已完成' },
];

export function KanbanBoard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    // Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        })
    );

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const data = await getTasks();
            // 这里确保按 position 排序，虽然后端排了，前端为了保险再排一次
            setTasks(data.sort((a, b) => a.position - b.position));
        } catch (error) {
            console.error("加载任务失败", error);
        }
    };

    const handleAddTask = async (title: string, status: TaskStatus) => {
        try {
            const newTask = await createTask(title, status);
            setTasks([...tasks, newTask]);
        } catch (e) {
            alert("创建失败");
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("确定删除吗?")) return;
        const oldTasks = [...tasks];
        setTasks(tasks.filter(t => t.id !== id));

        try {
            await deleteTask(id);
        } catch (e) {
            setTasks(oldTasks);
            alert("删除失败");
        }
    }

    // --- Drag & Drop Logic ---

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === 'Task') {
            setActiveTask(event.active.data.current.task);
        }
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === 'Task';
        const isOverTask = over.data.current?.type === 'Task';

        if (!isActiveTask) return;

        // 场景1: 任务移到另一个任务上
        if (isActiveTask && isOverTask) {
            setTasks(tasks => {
                const activeIndex = tasks.findIndex(t => t.id === activeId);
                const overIndex = tasks.findIndex(t => t.id === overId);

                if (tasks[activeIndex].status !== tasks[overIndex].status) {
                    const newTasks = [...tasks];
                    newTasks[activeIndex].status = tasks[overIndex].status;
                    return arrayMove(newTasks, activeIndex, overIndex);
                }

                return arrayMove(tasks, activeIndex, overIndex);
            });
        }

        // 场景2: 任务移到空白泳道上
        const isOverColumn = COLUMNS.some(col => col.id === overId);
        if (isActiveTask && isOverColumn) {
            setTasks(tasks => {
                const activeIndex = tasks.findIndex(t => t.id === activeId);
                const newStatus = overId as TaskStatus;

                if (tasks[activeIndex].status !== newStatus) {
                    const newTasks = [...tasks];
                    newTasks[activeIndex].status = newStatus;
                    return arrayMove(newTasks, activeIndex, activeIndex);
                }
                return tasks;
            });
        }
    };

    const onDragEnd = async (event: DragEndEvent) => {
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const currentTask = tasks.find(t => t.id === activeId);

        if (currentTask) {
            // 计算新的 position 并持久化
            const sameColTasks = tasks.filter(t => t.status === currentTask.status);
            const indexInCol = sameColTasks.findIndex(t => t.id === activeId);

            let newPos = currentTask.position;
            const prevTask = sameColTasks[indexInCol - 1];
            const nextTask = sameColTasks[indexInCol + 1];

            // 简单的排序算法：取前后平均值
            if (!prevTask && !nextTask) {
                newPos = 10000;
            } else if (!prevTask) {
                newPos = (nextTask?.position || 0) / 2;
            } else if (!nextTask) {
                newPos = (prevTask?.position || 0) + 10000;
            } else {
                newPos = (prevTask.position + nextTask.position) / 2;
            }

            // 调用接口保存
            updateTask(activeId, {
                status: currentTask.status,
                position: newPos
            }).catch(err => {
                console.error("Save failed", err);
                // 失败应该回滚，这里简化处理，仅 Alert
            });
        }
    };

    return (
        <div className="h-screen w-full bg-indigo-50 flex flex-col">
            <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
                    <h1 className="text-xl font-semibold text-gray-800">Longmao Kanban</h1>
                </div>
            </header>

            <div className="flex-1 overflow-x-auto p-8">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDragEnd={onDragEnd}
                >
                    <div className="flex gap-6 h-full w-fit mx-auto px-4">
                        {COLUMNS.map(col => (
                            <Column
                                key={col.id}
                                id={col.id}
                                title={col.title}
                                tasks={tasks.filter(t => t.status === col.id)}
                                onDeleteTask={handleDelete}
                                onAddTask={handleAddTask}
                            />
                        ))}
                    </div>

                    {createPortal(
                        <DragOverlay>
                            {activeTask && (
                                <TaskCard task={activeTask} onDelete={() => { }} />
                            )}
                        </DragOverlay>,
                        document.body
                    )}
                </DndContext>
            </div>
        </div>
    );
}
