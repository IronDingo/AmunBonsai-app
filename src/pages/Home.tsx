import React from 'react';
import { Task, PlantGroup } from '../types/models';
import { format, isAfter } from 'date-fns';

interface HomeProps {
  tasks: Task[];
  groups: PlantGroup[];
}

const HomePage: React.FC<HomeProps> = ({ tasks, groups }) => {
  const getPlantName = (plantId: string) => {
    for (const group of groups) {
      const plant = group.plants.find(p => p.id === plantId);
      if (plant) return plant.name;
    }
    return 'Unknown Plant';
  };

  const overdueTasks = tasks.filter(task => isAfter(new Date(), task.date));
  const upcomingTasks = tasks
    .filter(task => !isAfter(new Date(), task.date))
    .slice(0, 5);

  return (
    <div className="home-page">
      <h1>Plant Care Dashboard</h1>
      
      {overdueTasks.length > 0 && (
        <div className="overdue-tasks">
          <h2>Overdue Tasks</h2>
          {overdueTasks.map(task => (
            <div key={task.id} className="task-card overdue">
              <h3>{getPlantName(task.plantId)} - {task.type}</h3>
              <p>Due: {format(task.date, 'MMM d, yyyy')}</p>
            </div>
          ))}
        </div>
      )}

      <div className="upcoming-tasks">
        <h2>Upcoming Tasks</h2>
        {upcomingTasks.map(task => (
          <div key={task.id} className="task-card">
            <h3>{getPlantName(task.plantId)} - {task.type}</h3>
            <p>Due: {format(task.date, 'MMM d, yyyy')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export { HomePage };
export default HomePage;
