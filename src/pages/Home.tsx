import React from 'react';
import { Task, PlantGroup, TaskType } from '../types/models';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { TaskColors } from '../constants/taskColors';

interface HomePageProps {
  tasks: Task[];
  groups: PlantGroup[];
  onTaskComplete: (taskId: string, type: TaskType, plantId: string) => void;
  onTaskDelete: (taskId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ tasks, groups, onTaskComplete, onTaskDelete }) => {
  const getPlantName = (plantId: string) => {
    for (const group of groups) {
      const plant = group.plants.find(p => p.id === plantId);
      if (plant) return plant.name;
    }
    return 'Unknown Plant';
  };

  const sortedTasks = [...tasks].sort((a, b) => a.date.getTime() - b.date.getTime());

  const groupedTasks = {
    today: sortedTasks.filter(task => isToday(task.date)),
    tomorrow: sortedTasks.filter(task => isTomorrow(task.date)),
    thisWeek: sortedTasks.filter(task => isThisWeek(task.date) && !isToday(task.date) && !isTomorrow(task.date)),
    later: sortedTasks.filter(task => !isThisWeek(task.date))
  };

  const renderTaskGroup = (tasks: Task[], title: string) => {
    if (tasks.length === 0) return null;

    return (
      <div className="task-group">
        <h2>{title}</h2>
        <div className="task-list">
          {tasks.map(task => (
            <div 
              key={task.id} 
              className="home-task-card"
              style={{ borderLeftColor: TaskColors[task.type] }}
            >
              <div className="task-main">
                <div className="task-header">
                  <span className="plant-name">{getPlantName(task.plantId)}</span>
                  <span className="task-date">{format(task.date, 'MMM d')}</span>
                </div>
                <div className="task-type">{task.type}</div>
                {task.notes && <div className="task-notes">{task.notes}</div>}
              </div>
              <div className="task-actions">
                <button 
                  className="action-button complete"
                  onClick={() => onTaskComplete(task.id, task.type, task.plantId)}
                >
                  ✓
                </button>
                <button 
                  className="action-button delete"
                  onClick={() => onTaskDelete(task.id)}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Welcome to BonsaiApp</h1>
        <div className="task-summary">
          <div className="summary-card">
            <span className="count">{groupedTasks.today.length}</span>
            <span className="label">Today</span>
          </div>
          <div className="summary-card">
            <span className="count">{groupedTasks.tomorrow.length}</span>
            <span className="label">Tomorrow</span>
          </div>
          <div className="summary-card">
            <span className="count">{groupedTasks.thisWeek.length}</span>
            <span className="label">This Week</span>
          </div>
        </div>
      </div>
      
      <div className="tasks-container">
        {renderTaskGroup(groupedTasks.today, "Today's Tasks")}
        {renderTaskGroup(groupedTasks.tomorrow, "Tomorrow's Tasks")}
        {renderTaskGroup(groupedTasks.thisWeek, "This Week")}
        {renderTaskGroup(groupedTasks.later, "Upcoming")}
      </div>
    </div>
  );
};

export default HomePage;
