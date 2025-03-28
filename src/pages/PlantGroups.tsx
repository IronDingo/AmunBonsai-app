import React, { useState, useRef, useEffect } from 'react';
import { PlantGroup, Plant, Task, TaskType } from '../types/models';
import { TaskColors } from '../constants/taskColors';
import { format, isPast, isFuture } from 'date-fns';
import { DEFAULT_PLANT_IMAGE } from '../assets/constants';

interface PlantGroupsProps {
  groups: PlantGroup[];
  onAddGroup: (group: PlantGroup) => void;
  onAddPlant: (groupId: string, plant: Plant) => void;
  onUpdatePlant: (groupId: string, plantId: string, plant: Plant) => void;
  onUpdateGroup: (group: PlantGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onDeletePlant: (groupId: string, plantId: string) => void;
  tasks: Task[];
  onTaskComplete: (taskId: string, type: TaskType, plantId: string) => void;
}

interface ExpandedPlant {
  groupId: string;
  plantId: string;
}

interface PlantFormData {
  name: string;
  details: string;
  waterSchedule: string;
  fertilizeSchedule: string;
  source: string;
  pottingMix: string;
  additionalNotes: string;
  image: File | null;
  fertilizer: string;
}

const PlantGroups: React.FC<PlantGroupsProps> = ({ groups, onAddGroup, onAddPlant, onUpdatePlant, onUpdateGroup, onDeleteGroup, onDeletePlant, tasks, onTaskComplete }) => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isAddingPlant, setIsAddingPlant] = useState<string | null>(null);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [plantFormData, setPlantFormData] = useState<PlantFormData>({
    name: '',
    details: '',
    waterSchedule: '',
    fertilizeSchedule: '',
    source: '',
    pottingMix: '',
    additionalNotes: '',
    image: null,
    fertilizer: ''
  });
  const [newGroupImage, setNewGroupImage] = useState<File | null>(null);
  const addPlantFileRef = useRef<HTMLInputElement>(null);
  const addGroupFileRef = useRef<HTMLInputElement>(null);
  const [expandedPlant, setExpandedPlant] = useState<ExpandedPlant | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<{ groupId: string; plantId?: string } | null>(null);

  useEffect(() => {
    if (editingPlant) {
      setPlantFormData({
        name: editingPlant.name,
        details: editingPlant.details,
        waterSchedule: editingPlant.waterSchedule?.toString() || '',
        fertilizeSchedule: editingPlant.fertilizeSchedule?.toString() || '',
        source: editingPlant.source || '',
        pottingMix: editingPlant.pottingMix || '',
        additionalNotes: editingPlant.additionalNotes || '',
        image: null,
        fertilizer: editingPlant.fertilizer || ''
      });
    }
  }, [editingPlant]);

  const handleNewGroupImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewGroupImage(file);
    }
  };

  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let coverImage = DEFAULT_PLANT_IMAGE;
    
    if (newGroupImage) {
      const reader = new FileReader();
      coverImage = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(newGroupImage);
      });
    }

    onAddGroup({
      id: `group-${Date.now()}`,
      name: newGroupName,
      coverImage,
      plants: []
    });
    setNewGroupName('');
    setNewGroupImage(null);
    setIsAddingGroup(false);
  };

  const resetPlantForm = () => {
    setPlantFormData({
      name: '',
      details: '',
      waterSchedule: '',
      fertilizeSchedule: '',
      source: '',
      pottingMix: '',
      additionalNotes: '',
      image: null,
      fertilizer: ''
    });
    setIsAddingPlant(null);
    setEditingPlant(null);
  };

  const handlePlantSubmit = (groupId: string) => async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = DEFAULT_PLANT_IMAGE;

    const imageFile = plantFormData.image;
    if (imageFile) {
      const reader = new FileReader();
      imageUrl = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const result = reader.result;
          if (typeof result === 'string') {
            resolve(result);
          } else {
            resolve(DEFAULT_PLANT_IMAGE);
          }
        };
        reader.readAsDataURL(imageFile);
      });
    }

    const plantData = {
      id: editingPlant?.id || `plant-${Date.now()}`,
      name: plantFormData.name,
      groupId,
      details: plantFormData.details,
      images: editingPlant ? 
        (plantFormData.image ? [imageUrl, ...editingPlant.images] : editingPlant.images) :
        [imageUrl],
      waterSchedule: parseInt(plantFormData.waterSchedule) || undefined,
      fertilizeSchedule: parseInt(plantFormData.fertilizeSchedule) || undefined,
      source: plantFormData.source,
      pottingMix: plantFormData.pottingMix,
      additionalNotes: plantFormData.additionalNotes,
      lastWatered: editingPlant?.lastWatered,
      lastFertilized: editingPlant?.lastFertilized,
      fertilizer: plantFormData.fertilizer
    };

    if (editingPlant) {
      onUpdatePlant(groupId, editingPlant.id, plantData);
    } else {
      onAddPlant(groupId, plantData);
    }

    resetPlantForm();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadTarget) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        if (uploadTarget.plantId) {
          const group = groups.find(g => g.id === uploadTarget.groupId);
          if (group) {
            const plant = group.plants.find(p => p.id === uploadTarget.plantId);
            if (plant) {
              onUpdatePlant(
                uploadTarget.groupId,
                uploadTarget.plantId,
                { ...plant, images: [imageUrl, ...plant.images] }
              );
            }
          }
        } else {
          const group = groups.find(g => g.id === uploadTarget.groupId);
          if (group) {
            onUpdateGroup({ ...group, coverImage: imageUrl });
          }
        }
      };
      reader.readAsDataURL(file);
    }
    setUploadTarget(null);
  };

  const handleGroupClick = (groupId: string) => {
    setSelectedGroup(selectedGroup === groupId ? null : groupId);
    setExpandedPlant(null);
  
    // Only scroll if we're selecting a new group (not closing one)
    if (selectedGroup !== groupId) {
      // Add small delay to allow state update and transition to start
      setTimeout(() => {
        const element = document.getElementById(`group-${groupId}`);
        if (element) {
          const offset = 100; // Adjust this value as needed
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  };

  const handlePlantClick = (groupId: string, plantId: string) => {
    setExpandedPlant(expandedPlant?.plantId === plantId ? null : { groupId, plantId });
  };

  const renderPlantDetails = (plant: Plant) => {
    if (!expandedPlant || expandedPlant.plantId !== plant.id) return null;

    const plantTasks = tasks.filter(t => t.plantId === plant.id);
    const overdueTasks = plantTasks.filter(t => !t.completed && isPast(t.date));
    const upcomingTasks = plantTasks.filter(t => !t.completed && isFuture(t.date));
    const lastCompletedTasks = plantTasks
      .filter(t => t.completed)
      .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime())
      .slice(0, 3);

    return (
      <div className="plant-details">
        <div className="plant-images">
          {plant.images.map((image, index) => (
            <img key={index} src={image} alt={`${plant.name} ${index + 1}`} />
          ))}
          <button className="action-button" onClick={() => {
            setUploadTarget({ groupId: plant.groupId, plantId: plant.id });
            fileInputRef.current?.click();
          }}>
            <svg viewBox="0 0 24 24">
              <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"/>
            </svg>
          </button>
        </div>
        <div className="plant-info">
          <div className="task-history-section">
            <h3>Last Actions</h3>
            {lastCompletedTasks.length > 0 ? (
              lastCompletedTasks.map(task => (
                <div key={task.id} className="task-history-item">
                  <span className="task-type" style={{ color: TaskColors[task.type] }}>
                    {task.type}
                  </span>
                  <span className="task-date">
                    {format(task.completedAt!, 'MMM d, yyyy')}
                  </span>
                </div>
              ))
            ) : (
              <p>No completed tasks</p>
            )}
          </div>

          {overdueTasks.length > 0 && (
            <div className="task-section overdue">
              <h3>Overdue</h3>
              {overdueTasks.map(task => (
                <div key={task.id} className="task-item">
                  <span className="task-type" style={{ color: TaskColors[task.type] }}>
                    {task.type}
                  </span>
                  <span className="task-date">{format(task.date, 'MMM d')}</span>
                  <button 
                    className="action-button complete"
                    onClick={() => onTaskComplete(task.id, task.type, task.plantId)}
                  >
                    ✓
                  </button>
                </div>
              ))}
            </div>
          )}

          {upcomingTasks.length > 0 && (
            <div className="task-section upcoming">
              <h3>Upcoming</h3>
              {upcomingTasks.map(task => (
                <div key={task.id} className="task-item">
                  <span className="task-type" style={{ color: TaskColors[task.type] }}>
                    {task.type}
                  </span>
                  <span className="task-date">{format(task.date, 'MMM d')}</span>
                </div>
              ))}
            </div>
          )}

          <p><strong>Last Watered:</strong> {plant.lastWatered ? format(plant.lastWatered, 'MMM d, yyyy') : 'Not recorded'}</p>
          <p><strong>Watering Frequency:</strong> {plant.waterSchedule ? `Every ${plant.waterSchedule} days` : 'Not set'}</p>
          <p><strong>Last Fertilized:</strong> {plant.lastFertilized ? format(plant.lastFertilized, 'MMM d, yyyy') : 'Not recorded'}</p>
          <p><strong>Fertilizing Frequency:</strong> {plant.fertilizeSchedule ? `Every ${plant.fertilizeSchedule} days` : 'Not set'}</p>
          <p><strong>Fertilizer:</strong> {plant.fertilizer || 'Not recorded'}</p>
          <p><strong>Source:</strong> {plant.source || 'Not recorded'}</p>
          <p><strong>Potting Mix:</strong> {plant.pottingMix || 'Not recorded'}</p>
          <p><strong>Notes:</strong> {plant.additionalNotes || 'No additional notes'}</p>
        </div>
        <div className="plant-actions">
          <button 
            className="button-primary"
            onClick={() => {
              setEditingPlant(plant);
              setIsAddingPlant(plant.groupId);
              setExpandedPlant(null);
            }}
          >
            Edit
          </button>
          <button 
            className="button-secondary"
            onClick={() => setExpandedPlant(null)}
          >
            Close
          </button>
          <button
            className="button-delete"
            onClick={() => onDeletePlant(plant.groupId, plant.id)}
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  const renderGroupHeader = (group: PlantGroup) => (
    <div className="group-header">
      <img 
        src={group.coverImage || DEFAULT_PLANT_IMAGE} 
        alt={group.name}
        onClick={() => setSelectedGroup(selectedGroup === group.id ? null : group.id)}
      />
      <div className="group-actions">
        <button 
          className="action-button"
          onClick={(e) => {
            e.stopPropagation();
            setUploadTarget({ groupId: group.id });
            fileInputRef.current?.click();
          }}
          title="Change cover image"
        >
          <svg viewBox="0 0 24 24">
            <path d="M3 4V1h2v3h3v2H5v3H3V6H0V4h3zm3 6V7h3V4h7l1.83 2H21c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10h3zm7 9c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z"/>
          </svg>
        </button>
        <button 
          className="action-button"
          onClick={(e) => {
            e.stopPropagation();
            const newName = prompt('Enter new name:', group.name);
            if (newName && newName !== group.name) {
              onUpdateGroup({ ...group, name: newName });
            }
          }}
          title="Edit name"
        >
          <svg viewBox="0 0 24 24">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
        <button 
          className="action-button"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Delete "${group.name}" and all its plants?`)) {
              onDeleteGroup(group.id);
            }
          }}
          title="Delete collection"
        >
          <svg viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
      <div className="group-header-overlay">
        <h3>{group.name}</h3>
      </div>
    </div>
  );

  return (
    <div className="plant-groups-page">
      <h1>Plant Collections</h1>
      
      <div className="groups-container">
        {[
          ...groups.filter(g => g.id === selectedGroup),
          ...groups.filter(g => g.id !== selectedGroup)
        ].map(group => (
          <div 
            id={`group-${group.id}`}
            key={group.id} 
            className={`group-card ${selectedGroup === group.id ? 'expanded' : ''}`}
          >
            <div 
              className="group-header"
              onClick={() => handleGroupClick(group.id)}
            >
              {renderGroupHeader(group)}
            </div>
            
            {selectedGroup === group.id && (
              <div className="plant-list">
                <div className="plant-grid">
                  {group.plants.map(plant => (
                    <div 
                      key={plant.id} 
                      className={`plant-card ${expandedPlant?.plantId === plant.id ? 'expanded' : ''}`}
                      onClick={() => handlePlantClick(group.id, plant.id)}
                    >
                      <div className="plant-card-content">
                        <img 
                          src={plant.images[0] || DEFAULT_PLANT_IMAGE} 
                          alt={plant.name}
                        />
                        <h4>{plant.name}</h4>
                      </div>
                      {renderPlantDetails(plant)}
                    </div>
                  ))}
                  <button 
                    className="add-plant-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddingPlant(group.id);
                    }}
                  >
                    + Add Plant
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button 
        className="add-collection-button"
        onClick={() => setIsAddingGroup(true)}
        title="Add New Collection"
        aria-label="Add new collection"
      >
        +
      </button>
      
      {isAddingGroup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>New Collection</h2>
            <form onSubmit={handleGroupSubmit} className="add-form">
              <div className="form-field">
                <label>Collection Name</label>
                <input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter collection name"
                  required
                  autoFocus
                />
              </div>
              
              <div className="form-field">
                <label>Cover Image</label>
                <div className="image-upload">
                  {newGroupImage ? (
                    <img 
                      src={URL.createObjectURL(newGroupImage)} 
                      alt="Preview" 
                      className="image-preview"
                    />
                  ) : (
                    <div className="image-placeholder">
                      Click to select image
                    </div>
                  )}
                  <input
                    type="file"
                    ref={addGroupFileRef}
                    hidden
                    accept="image/*"
                    onChange={handleNewGroupImageSelect}
                  />
                  <button 
                    type="button" 
                    className="select-image-button"
                    onClick={() => addGroupFileRef.current?.click()}
                  >
                    Select Image
                  </button>
                </div>
              </div>

              <div className="modal-buttons">
                <button type="button" onClick={() => setIsAddingGroup(false)} className="button-secondary">
                  Cancel
                </button>
                <button type="submit" className="button-primary">
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddingPlant && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingPlant ? 'Edit Plant' : 'New Plant'}</h2>
            <form onSubmit={handlePlantSubmit(isAddingPlant)} className="add-form">
              <div className="form-field">
                <label>Plant Name</label>
                <input
                  value={plantFormData.name}
                  onChange={(e) => setPlantFormData({...plantFormData, name: e.target.value})}
                  placeholder="Enter plant name"
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label>Watering Frequency (days)</label>
                  <input
                    type="number"
                    value={plantFormData.waterSchedule}
                    onChange={(e) => setPlantFormData({...plantFormData, waterSchedule: e.target.value})}
                    placeholder="Days between watering"
                  />
                </div>

                <div className="form-field">
                  <label>Fertilizing Frequency (days)</label>
                  <input
                    type="number"
                    value={plantFormData.fertilizeSchedule}
                    onChange={(e) => setPlantFormData({...plantFormData, fertilizeSchedule: e.target.value})}
                    placeholder="Days between fertilizing"
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Source</label>
                <input
                  value={plantFormData.source}
                  onChange={(e) => setPlantFormData({...plantFormData, source: e.target.value})}
                  placeholder="Where did you get this plant?"
                />
              </div>

              <div className="form-field">
                <label>Potting Mix</label>
                <input
                  value={plantFormData.pottingMix}
                  onChange={(e) => setPlantFormData({...plantFormData, pottingMix: e.target.value})}
                  placeholder="What soil mix are you using?"
                />
              </div>

              <div className="form-field">
                <label>Plant Image</label>
                <div className="image-upload">
                  {plantFormData.image ? (
                    <img 
                      src={URL.createObjectURL(plantFormData.image)} 
                      alt="Preview" 
                      className="image-preview"
                    />
                  ) : editingPlant?.images[0] ? (
                    <img 
                      src={editingPlant.images[0]} 
                      alt="Current" 
                      className="image-preview"
                    />
                  ) : (
                    <div className="image-placeholder">
                      Click to select image
                    </div>
                  )}
                  <input
                    type="file"
                    ref={addPlantFileRef}
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPlantFormData({...plantFormData, image: file});
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    className="select-image-button"
                    onClick={() => addPlantFileRef.current?.click()}
                  >
                    {editingPlant ? 'Change Image' : 'Select Image'}
                  </button>
                </div>
              </div>

              <div className="form-field">
                <label>Fertilizer</label>
                <input
                  value={plantFormData.fertilizer}
                  onChange={(e) => setPlantFormData({...plantFormData, fertilizer: e.target.value})}
                  placeholder="What fertilizer do you use?"
                />
              </div>

              <div className="form-field">
                <label>Additional Notes</label>
                <textarea
                  value={plantFormData.additionalNotes}
                  onChange={(e) => setPlantFormData({...plantFormData, additionalNotes: e.target.value})}
                  placeholder="Any additional notes about this plant"
                  rows={4}
                />
              </div>

              <div className="modal-buttons">
                <button type="button" onClick={resetPlantForm} className="button-secondary">
                  Cancel
                </button>
                <button type="submit" className="button-primary">
                  {editingPlant ? 'Save Changes' : 'Add Plant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export { PlantGroups };
export default PlantGroups;
