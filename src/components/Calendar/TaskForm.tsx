import React, { useState } from 'react';
import { Plant, Task, TaskType } from '../../types/models';
import { format } from 'date-fns';

interface TaskFormProps {
    selectedDate: Date;
    plants: Plant[];
    onSubmit: (task: Task) => void;
    onClose: () => void;
    editTask?: Task;
}

export const TaskForm: React.FC<TaskFormProps> = ({ selectedDate, plants, onSubmit, onClose, editTask }) => {
    const [taskData, setTaskData] = useState({
        plantId: editTask?.plantId || '',
        type: editTask?.type || TaskType.Water,
        notes: editTask?.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const task: Task = {
            id: editTask?.id || `task-${Date.now()}`,
            plantId: taskData.plantId,
            type: taskData.type,
            date: selectedDate,
            notes: taskData.notes,
            completed: editTask?.completed || false,
            completedAt: editTask?.completedAt || undefined
        };
        onSubmit(task);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>{editTask ? 'Edit Task' : 'New Task'} for {format(selectedDate, 'MMM d, yyyy')}</h2>
                <form onSubmit={handleSubmit} className="task-form">
                    <div className="form-field">
                        <label>Plant</label>
                        <select
                            value={taskData.plantId}
                            onChange={e => setTaskData({ ...taskData, plantId: e.target.value })}
                            required
                        >
                            <option value="">Select a plant</option>
                            {plants.map(plant => (
                                <option key={plant.id} value={plant.id}>
                                    {plant.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field">
                        <label>Task Type</label>
                        <select
                            value={taskData.type}
                            onChange={e => setTaskData({ ...taskData, type: e.target.value as TaskType })}
                            required
                        >
                            {Object.values(TaskType).map(type => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field">
                        <label>Notes</label>
                        <textarea
                            value={taskData.notes}
                            onChange={e => setTaskData({ ...taskData, notes: e.target.value })}
                            placeholder="Add any notes..."
                        />
                    </div>

                    <div className="modal-buttons">
                        <button type="button" onClick={onClose} className="button-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="button-primary">
                            {editTask ? 'Save Changes' : 'Add Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
