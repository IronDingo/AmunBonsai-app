import React, { useState } from 'react';
import { Task, TaskType, Plant } from '../../types/models';
import { TaskForm } from '../Tasks/TaskForm';
import { TaskColors } from '../../constants/taskColors';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths } from 'date-fns';

interface CalendarProps {
    tasks: Task[];
    plants: Plant[];
    onTaskClick: (task: Task) => void;
    onAddTask: (task: Task) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ 
    tasks, 
    plants,
    onTaskClick,
    onAddTask 
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const getDaysInMonth = () => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
    };

    const getTasksForDay = (date: Date) => {
        return tasks.filter(task => 
            format(task.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
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
                            {getTasksForDay(day).map(task => {
                                const plant = plants.find(p => p.id === task.plantId);
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
                                        <span>{plant?.name} - {task.type}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <button onClick={() => setCurrentDate(addMonths(currentDate, -1))}>
                    Previous
                </button>
                <h2>{format(currentDate, 'MMMM yyyy')}</h2>
                <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
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
