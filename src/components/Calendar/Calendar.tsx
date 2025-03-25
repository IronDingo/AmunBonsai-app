import React, { useState } from 'react';
import { Task, Plant } from '../../types/models';
import { TaskColors } from '../../constants/taskColors';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths } from 'date-fns';
import { TaskForm } from './TaskForm';

interface CalendarProps {
    tasks: Task[];
    plants: Plant[];
    onTaskClick: (task: Task) => void;
    onAddTask: (task: Task) => void;
    onDeleteTask: (taskId: string) => void;  // Add this prop
}

interface TaskPopupInfo {
    task: Task;
    position: { x: number; y: number };
}

export const Calendar: React.FC<CalendarProps> = ({ tasks, plants, onTaskClick, onAddTask, onDeleteTask }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [activeTask, setActiveTask] = useState<TaskPopupInfo | null>(null);

    const getDaysInMonth = () => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
    };

    const getTasksForDay = (date: Date) => {
        return tasks.filter(task => {
            const taskPlant = plants.find(p => p.id === task.plantId);
            // Only return tasks that have an associated plant
            return format(task.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && taskPlant;
        });
    };

    const renderTaskIndicator = (task: Task) => {
        const plant = plants.find(p => p.id === task.plantId);
        if (!plant) {
            onDeleteTask(task.id);
            return null;
        }

        return (
            <div 
                key={task.id}
                className="task-indicator"
                style={{ backgroundColor: TaskColors[task.type] }}
                onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setActiveTask({
                        task,
                        position: { x: rect.left, y: rect.bottom }
                    });
                }}
            >
                <span className="task-plant-name">{plant.name}</span>
            </div>
        );
    };

    const renderTaskPopup = () => {
        if (!activeTask) return null;
        const plant = plants.find(p => p.id === activeTask.task.plantId);
        if (!plant) return null;

        return (
            <div 
                className="task-popup"
                style={{
                    left: activeTask.position.x,
                    top: activeTask.position.y
                }}
            >
                <div className="task-popup-header">
                    <span className="task-type" style={{ color: TaskColors[activeTask.task.type] }}>
                        {activeTask.task.type}
                    </span>
                    <span className="task-plant">{plant.name}</span>
                </div>
                {activeTask.task.notes && (
                    <p className="task-notes">{activeTask.task.notes}</p>
                )}
                <div className="task-popup-actions">
                    <button 
                        className="action-button"
                        onClick={() => {
                            onTaskClick(activeTask.task);
                            setActiveTask(null);
                        }}
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
                        </svg>
                    </button>
                    <button 
                        className="action-button delete"
                        onClick={() => {
                            if (window.confirm('Delete this task?')) {
                                onDeleteTask(activeTask.task.id);
                            }
                            setActiveTask(null);
                        }}
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/>
                        </svg>
                    </button>
                </div>
            </div>
        );
    };

    const renderCalendar = () => {
        const days = getDaysInMonth();
        
        return (
            <div className="calendar-grid" onClick={() => setActiveTask(null)}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="calendar-header">{day}</div>
                ))}
                {days.map(day => (
                    <div 
                        key={day.toString()} 
                        className="calendar-day"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(day);
                            setActiveTask(null);
                        }}
                    >
                        <span className="day-number">{format(day, 'd')}</span>
                        <div className="task-indicators">
                            {getTasksForDay(day).map(task => renderTaskIndicator(task))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <button className="button-secondary" onClick={() => setCurrentDate(addMonths(currentDate, -1))}>
                    Previous
                </button>
                <h2>{format(currentDate, 'MMMM yyyy')}</h2>
                <button className="button-secondary" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                    Next
                </button>
            </div>
            {renderCalendar()}
            {selectedDate && (
                <TaskForm
                    selectedDate={selectedDate}
                    plants={plants}
                    onSubmit={onAddTask}
                    onClose={() => setSelectedDate(null)}
                />
            )}
            {renderTaskPopup()}
        </div>
    );
};
