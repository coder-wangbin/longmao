import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types';
import { clsx } from 'clsx';

interface Props {
    task: Task;
    onDelete: (id: string) => void;
}

export function TaskCard({ task, onDelete }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-white p-4 rounded-lg shadow-sm border-2 border-primary-500 opacity-50 h-[100px]"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={clsx(
                "group relative bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow touch-none cursor-grab active:cursor-grabbing",
                "flex flex-col gap-2"
            )}
        >
            <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-800 break-all">{task.title}</h3>
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // prevent drag start
                        onDelete(task.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            {task.content && <p className="text-sm text-gray-500 line-clamp-2">{task.content}</p>}
        </div>
    );
}
