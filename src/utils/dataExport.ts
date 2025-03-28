import { PlantGroup, Task, serializeTask } from '../types/models';

export interface AppData {
  tasks: ReturnType<typeof serializeTask>[];
  groups: PlantGroup[];
  version: string;
}

export const exportData = (tasks: Task[], groups: PlantGroup[]): string => {
  const data: AppData = {
    tasks: tasks.map(serializeTask),
    groups,
    version: '1.0'
  };
  return JSON.stringify(data, null, 2);
};

export const downloadJson = (data: string, filename: string) => {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importData = async (file: File): Promise<AppData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.version || !data.tasks || !data.groups) {
          throw new Error('Invalid data format');
        }
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
