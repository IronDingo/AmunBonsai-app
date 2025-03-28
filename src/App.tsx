import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Task, PlantGroup, Plant, TaskType, serializeTask, deserializeTask } from './types/models';
import HomePage from './pages/Home';
import { PlantGroups } from './pages/PlantGroups';
import { Calendar } from './components/Calendar/Calendar';
import './styles/app.css';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved).map(deserializeTask) : [];
  });

  const [groups, setGroups] = useState<PlantGroup[]>(() => {
    const saved = localStorage.getItem('groups');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks.map(serializeTask)));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('groups', JSON.stringify(groups));
  }, [groups]);

  const handleAddGroup = (group: PlantGroup) => {
    setGroups([...groups, group]);
  };

  const handleAddPlant = (groupId: string, plant: Plant) => {
    setGroups(groups.map(group =>
      group.id === groupId ? { ...group, plants: [...group.plants, plant] } : group
    ));
  };

  const handleAddTask = (task: Task) => {
    setTasks([...tasks, task]);
    setGroups(groups.map(group => ({
      ...group,
      plants: group.plants.map(plant =>
        plant.id === task.plantId
          ? {
              ...plant,
              lastWatered: task.type === TaskType.Water ? task.date : plant.lastWatered,
              lastFertilized: task.type === TaskType.Fertilize ? task.date : plant.lastFertilized,
            }
          : plant
      ),
    })));
  };

  const handleUpdatePlant = (groupId: string, plantId: string, updatedPlant: Plant) => {
    setGroups(groups.map(group =>
      group.id === groupId
        ? { ...group, plants: group.plants.map(plant => plant.id === plantId ? updatedPlant : plant) }
        : group
    ));
  };

  const handleUpdateGroup = (updatedGroup: PlantGroup) => {
    setGroups(groups.map(group => group.id === updatedGroup.id ? updatedGroup : group));
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      setGroups(groups.filter(group => group.id !== groupId));
    }
  };

  const handleDeletePlant = (groupId: string, plantId: string) => {
    if (window.confirm('Are you sure you want to delete this plant?')) {
      setGroups(groups.map(group =>
        group.id === groupId
          ? { ...group, plants: group.plants.filter(plant => plant.id !== plantId) }
          : group
      ));
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleTaskComplete = (taskId: string, type: TaskType, plantId: string) => {
    const now = new Date();
    // Update task
    setTasks(prev => prev.filter(t => t.id !== taskId));
    
    // Update plant's last watered/fertilized date
    setGroups(groups.map(group => ({
      ...group,
      plants: group.plants.map(plant =>
        plant.id === plantId
          ? {
              ...plant,
              lastWatered: type === TaskType.Water ? now : plant.lastWatered,
              lastFertilized: type === TaskType.Fertilize ? now : plant.lastFertilized,
            }
          : plant
      ),
    })));
  };

  const getAllPlants = () => groups.flatMap(group => group.plants);

  return (
    <BrowserRouter>
      <div className="app-container">
        <nav className="main-nav">
          <Link to="/">Home</Link>
          <Link to="/plants">Plant Groups</Link>
          <Link to="/calendar">Calendar</Link>
        </nav>
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                tasks={tasks} 
                groups={groups} 
                onTaskComplete={handleTaskComplete}
                onTaskDelete={handleDeleteTask}
              />
            } 
          />
          <Route
            path="/plants"
            element={
              <PlantGroups
                groups={groups}
                tasks={tasks}
                onTaskComplete={handleTaskComplete}
                onAddGroup={handleAddGroup}
                onAddPlant={handleAddPlant}
                onUpdatePlant={handleUpdatePlant}
                onUpdateGroup={handleUpdateGroup}
                onDeleteGroup={handleDeleteGroup}
                onDeletePlant={handleDeletePlant}
              />
            }
          />
          <Route
            path="/calendar"
            element={
              <Calendar
                tasks={tasks}
                plants={getAllPlants()}
                onTaskClick={(task) => console.log('Task clicked:', task)}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;