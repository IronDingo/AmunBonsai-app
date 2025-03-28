import { TaskType } from '../types/models';

export const TaskColors: Record<TaskType, string> = {
    [TaskType.Water]: '#4287f5',
    [TaskType.Fertilize]: '#42f554',
    [TaskType.Repot]: '#f5a442',
    [TaskType.Prune]: '#f54242',
    [TaskType.LocationChange]: '#9942f5',
    [TaskType.Miscellaneous]: '#7a7a7a'
};
