import { TaskType } from '../types/models';

export const TaskColors: Record<TaskType, string> = {
    [TaskType.Water]: '#4287f5', // Blue
    [TaskType.Fertilize]: '#42f54b', // Green
    [TaskType.Repot]: '#8b4513', // Brown
    [TaskType.Prune]: '#f54242', // Red
    [TaskType.LocationChange]: '#9942f5', // Purple
    [TaskType.Miscellaneous]: '#808080' // Gray
};
