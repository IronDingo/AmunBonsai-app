import React, { useState } from 'react';
import { Task, PlantGroup, TaskType } from '../types/models';
import { format, isToday, isTomorrow, isThisWeek, isPast, isFuture } from 'date-fns';
import { TaskColors } from '../constants/taskColors';
import { useNavigate } from 'react-router-dom';

interface HomePageProps {
  tasks: Task[];
  groups: PlantGroup[];
  onTaskComplete: (taskId: string, type: TaskType, plantId: string) => void;
  onTaskDelete: (taskId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ tasks, groups, onTaskComplete, onTaskDelete }) => {
  const [focusedGroup, setFocusedGroup] = useState<string | null>(null);
  const navigate = useNavigate();

  const getPlantName = (plantId: string) => {
    for (const group of groups) {
      const plant = group.plants.find(p => p.id === plantId);
      if (plant) return plant.name;
    }
    return 'Unknown Plant';
  };

  const sortedTasks = [...tasks].sort((a, b) => a.date.getTime() - b.date.getTime());

  const groupedTasks = {
    overdue: sortedTasks.filter(task => 
      isPast(task.date) && !isToday(task.date) && !task.completed
    ),
    today: sortedTasks.filter(task => 
      isToday(task.date) && !task.completed
    ),
    tomorrow: sortedTasks.filter(task => 
      isTomorrow(task.date) && !task.completed
    ),
    thisWeek: sortedTasks.filter(task => 
      isThisWeek(task.date) && 
      isFuture(task.date) &&
      !isToday(task.date) && 
      !isTomorrow(task.date) &&
      !task.completed
    ),
    upcoming: sortedTasks.filter(task => 
      !isThisWeek(task.date) && 
      isFuture(task.date) &&
      !task.completed
    ),
    completed: sortedTasks.filter(task => task.completed),
  };

  const handleFocusGroup = (groupKey: string) => {
    setFocusedGroup(focusedGroup === groupKey ? null : groupKey);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isTop = target.scrollTop === 0;
    const isBottom = target.scrollHeight - target.scrollTop === target.clientHeight;
    
    target.closest('.task-group')?.classList.toggle('scrolled-top', isTop);
    target.closest('.task-group')?.classList.toggle('scrolled-bottom', isBottom);
  };

  const renderTaskGroup = (tasks: Task[], title: string, key: string) => {
    if (tasks.length === 0) return null;

    return (
      <div className={`task-group ${focusedGroup === key ? 'focused' : ''}`}>
        <h2>{title}</h2>
        <div className="task-list" onScroll={handleScroll}>
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
          <div 
            className={`summary-card overdue ${focusedGroup === 'overdue' ? 'focused' : ''} ${groupedTasks.overdue.length === 0 ? 'empty' : ''}`}
            onClick={() => handleFocusGroup('overdue')}
          >
            <span className="count">{groupedTasks.overdue.length}</span>
            <span className="label">Overdue</span>
          </div>
          <div 
            className={`summary-card ${focusedGroup === 'today' ? 'focused' : ''} ${groupedTasks.today.length === 0 ? 'empty' : ''}`}
            onClick={() => handleFocusGroup('today')}
          >
            <span className="count">{groupedTasks.today.length}</span>
            <span className="label">Today</span>
          </div>
          <div 
            className={`summary-card ${focusedGroup === 'tomorrow' ? 'focused' : ''} ${groupedTasks.tomorrow.length === 0 ? 'empty' : ''}`}
            onClick={() => handleFocusGroup('tomorrow')}
          >
            <span className="count">{groupedTasks.tomorrow.length}</span>
            <span className="label">Tomorrow</span>
          </div>
          <div 
            className={`summary-card ${focusedGroup === 'thisWeek' ? 'focused' : ''} ${groupedTasks.thisWeek.length === 0 ? 'empty' : ''}`}
            onClick={() => handleFocusGroup('thisWeek')}
          >
            <span className="count">{groupedTasks.thisWeek.length}</span>
            <span className="label">This Week</span>
          </div>
        </div>
      </div>
      
      <div className={`tasks-container ${focusedGroup ? 'has-focus' : ''}`}>
        {groupedTasks.overdue.length > 0 && (
          <div className="overdue-warning">
            ⚠️ You have {groupedTasks.overdue.length} overdue tasks
          </div>
        )}
        {Object.entries(groupedTasks).map(([key, tasks]) => (
          renderTaskGroup(
            tasks, 
            key === 'overdue' ? "Overdue Tasks" :
            key === 'today' ? "Today's Tasks" :
            key === 'tomorrow' ? "Tomorrow's Tasks" :
            key === 'thisWeek' ? "This Week" :
            key === 'upcoming' ? "Upcoming" : "Completed Tasks",
            key
          )
        ))}
      </div>

      <div className="floating-actions">
        <button 
          className="floating-button secondary"
          data-tooltip="Add New Plant"
          onClick={() => navigate('/plants')}
        >
          <svg viewBox="0 0 24 24">
            <path d="M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zm0-18c-4.97 0-9 4.03-9 9 4.97 0 9-4.03 9-9zm0 0c0 4.97 4.03 9 9 9-4.97 0-9-4.03-9-9z"/>
          </svg>
        </button>
        <button 
          className="floating-button primary"
          data-tooltip="Create New Task"
          onClick={() => navigate('/calendar')}
        >
          <svg viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
