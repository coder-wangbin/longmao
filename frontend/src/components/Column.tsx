import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';

interface Props {
    id: TaskStatus;
    title: string;
    tasks: Task[];
    onDeleteTask: (id: string) => void;
    onAddTask: (title: string, status: TaskStatus) => void;
}

export function Column({ id, title, tasks, onDeleteTask, onAddTask }: Props) {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isAdding && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isAdding]);

    const handleSubmit = () => {
        if (!newTitle.trim()) {
            setIsAdding(false);
            return;
        }
        // Correct order: title, status
        onAddTask(newTitle, id);
        setNewTitle('');
        // Keep focus
        textareaRef.current?.focus();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
        if (e.key === 'Escape') {
            setIsAdding(false);
        }
    };

    return (
        <div className="flex flex-col bg-gray-100 w-72 max-w-xs h-full max-h-full rounded-xl shadow-inner select-none px-2 py-3 gap-2">
            {/* Header */}
            <div className="flex items-center justify-between px-2">
                <h2 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                    {title}
                    <span className="text-gray-400 font-normal text-xs">{tasks.length}</span>
                </h2>
                <div className="flex gap-1">
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Task List */}
            <div ref={setNodeRef} className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-2 min-h-[0px] pr-1">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
                    ))}
                </SortableContext>

                {/* Inline Add Form */}
                {isAdding && (
                    <div className="flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-white rounded-lg shadow-sm border border-blue-500 overflow-hidden ring-2 ring-blue-100">
                            <textarea
                                ref={textareaRef}
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="为这张卡片输入标题..."
                                className="w-full text-sm p-3 outline-none resize-none block text-gray-700"
                                rows={3}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleSubmit}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors shadow-sm"
                            >
                                添加卡片
                            </button>
                            <button
                                onClick={() => setIsAdding(false)}
                                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Add Button */}
            {!isAdding && (
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200/50 w-full p-2 rounded-lg text-sm text-left transition-all duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    添加卡片
                </button>
            )}
        </div>
    );
}
