import React, { useState } from 'react';
import { Task, TaskType, Plant } from '../../types/models';

interface TaskFormProps {
  selectedDate: Date;
  plants: Plant[];
  onSubmit: (task: Task) => void;
  onClose: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  selectedDate,
  plants,
  onSubmit,
  onClose
}) => {
  const [taskData, setTaskData] = useState({
    plantId: '',
    type: TaskType.Water,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const task: Task = {
      id: `task-${Date.now()}`,
      date: selectedDate,
      ...taskData,
      completed: false
    };
    onSubmit(task);
    onClose();
  };

  return (
    <div className="task-form">
      <h3>Create Task</h3>
      <form onSubmit={handleSubmit}>
        <select
          value={taskData.plantId}
          onChange={e => setTaskData({...taskData, plantId: e.target.value})}
          required
        >
          <option value="">Select Plant</option>
          {plants.map(plant => (
            <option key={plant.id} value={plant.id}>
              {plant.name}
            </option>
          ))}
        </select>

        <select
          value={taskData.type}
          onChange={e => setTaskData({...taskData, type: e.target.value as TaskType})}
          required
        >
          {Object.values(TaskType).map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <textarea
          value={taskData.notes}
          onChange={e => setTaskData({...taskData, notes: e.target.value})}
          placeholder="Notes (optional)"
        />

        <div className="form-buttons">
          <button type="submit">Create Task</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
};
