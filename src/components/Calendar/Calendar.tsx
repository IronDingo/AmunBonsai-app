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

export const Calendar: React.FC<CalendarProps> = ({ tasks, plants, onTaskClick, onAddTask, onDeleteTask }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

    const renderTaskItem = (task: Task) => {
        const plant = plants.find(p => p.id === task.plantId);
        if (!plant) {
            // Clean up orphaned tasks
            onDeleteTask(task.id);
            return null;
        }

        return (
            <div 
                key={task.id}
                className="task-item"
                style={{ borderLeftColor: TaskColors[task.type] }}
                onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(task);
                }}
            >
                <div className="task-content">
                    <span>{plant.name} - {task.type}</span>
                    {task.notes && <span className="task-notes">{task.notes}</span>}
                </div>
                <div className="task-actions">
                    <button 
                        className="button-secondary button-small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onTaskClick(task);
                        }}
                    >
                        Edit
                    </button>
                    <button 
                        className="button-delete button-small"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this task?')) {
                                onDeleteTask(task.id);
                            }
                        }}
                    >
                        ×
                    </button>
                </div>
            </div>
        );
    };

    const renderCalendar = () => {
        const days = getDaysInMonth();
        
        return (
            <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="calendar-header">{day}</div>
                ))}
                {days.map(day => (
                    <div 
                        key={day.toString()} 
                        className="calendar-day"
                        onClick={() => setSelectedDate(day)}
                    >
                        <span className="day-number">{format(day, 'd')}</span>
                        <div className="task-list">
                            {getTasksForDay(day).map(task => renderTaskItem(task))}
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
        </div>
    );
};
