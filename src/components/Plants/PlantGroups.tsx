import React, { useState } from 'react';
import { PlantGroup, Plant } from '../../types/models';

interface PlantGroupsProps {
    groups: PlantGroup[];
    onAddGroup: (group: PlantGroup) => void;
    onAddPlant: (groupId: string, plant: Plant) => void;
}

export const PlantGroups: React.FC<PlantGroupsProps> = ({
    groups,
    onAddGroup,
    onAddPlant,
}) => {
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [showNewGroupForm, setShowNewGroupForm] = useState(false);

    const renderPlantList = (groupId: string) => {
        const group = groups.find(g => g.id === groupId);
        if (!group) return null;

        return (
            <div className="plant-list">
                {group.plants.map(plant => (
                    <div key={plant.id} className="plant-card">
                        <img 
                            src={plant.images[0]} 
                            alt={plant.name} 
                            className="plant-image"
                        />
                        <h4>{plant.name}</h4>
                        <p>{plant.details}</p>
                    </div>
                ))}
                <button 
                    className="add-plant-button"
                    onClick={() => handleAddPlant(groupId)}
                >
                    Add Plant
                </button>
            </div>
        );
    };

    const handleAddGroup = () => {
        const newGroup: PlantGroup = {
            id: `group-${Date.now()}`,
            name: 'New Group',
            coverImage: '',
            plants: []
        };
        onAddGroup(newGroup);
        setShowNewGroupForm(false);
    };

    const handleAddPlant = (groupId: string) => {
        const newPlant: Plant = {
            id: `plant-${Date.now()}`,
            name: 'New Plant',
            groupId,
            details: '',
            images: []
        };
        onAddPlant(groupId, newPlant);
    };

    return (
        <div className="plant-groups">
            <div className="groups-header">
                <h2>Plant Groups</h2>
                <button onClick={() => setShowNewGroupForm(true)}>
                    Add Group
                </button>
            </div>
            <div className="groups-container">
                {groups.map(group => (
                    <div key={group.id}>
                        <div 
                            className="group-card"
                            onClick={() => setSelectedGroup(
                                selectedGroup === group.id ? null : group.id
                            )}
                        >
                            <img src={group.coverImage} alt={group.name} />
                            <h3>{group.name}</h3>
                        </div>
                        {selectedGroup === group.id && renderPlantList(group.id)}
                    </div>
                ))}
            </div>
        </div>
    );
};
