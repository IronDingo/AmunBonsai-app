export interface Plant {
    id: string;
    name: string;
    groupId: string;
    details: string;
    images: string[];
    waterSchedule?: number; // days between watering
    fertilizeSchedule?: number; // days between fertilizing
    lastWatered?: Date;
    lastFertilized?: Date;
    source?: string;
    pottingMix?: string;
    additionalNotes?: string;
    fertilizer?: string;
}

export interface PlantGroup {
    id: string;
    name: string;
    coverImage: string;
    plants: Plant[];
}

export interface Task {
    id: string;
    plantId: string;
    type: TaskType;
    date: Date;
    notes?: string;
}

export enum TaskType {
    Water = 'Water',
    Fertilize = 'Fertilize',
    Repot = 'Repot',
    Prune = 'Prune',
    LocationChange = 'LocationChange',
    Miscellaneous = 'Miscellaneous'
}

// Add serialize/deserialize helpers
export const serializeTask = (task: Task): any => ({
    ...task,
    date: task.date.toISOString()
});

export const deserializeTask = (data: any): Task => ({
    ...data,
    date: new Date(data.date)
});
