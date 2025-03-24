import React from 'react';
import { Task, Plant } from '../types/models';
import { Calendar as CalendarComponent } from '../components/Calendar/Calendar';

interface CalendarPageProps {
  tasks: Task[];
  plants: Plant[];
  onTaskClick: (task: Task) => void;
  onAddTask: (task: Task) => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ tasks, plants, onTaskClick, onAddTask }) => {
  return (
    <div className="calendar-page">
      <h1>Calendar</h1>
      <CalendarComponent
        tasks={tasks}
        plants={plants}
        onTaskClick={onTaskClick}
        onAddTask={onAddTask}
      />
    </div>
  );
};

export { CalendarPage };
export default CalendarPage;
