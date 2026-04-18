import { create } from 'zustand';
import {
  Task,
  getTasksFromDB,
  addTaskToDB,
  updateTaskInDB,
  deleteTaskFromDB,
} from '../database/db';
import { scheduleTaskNotifications, cancelTaskNotifications } from '../utils/notifications';

interface TaskState {
  tasks: Task[];
  loadTasks: () => void;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  toggleTaskCompletion: (id: number) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],

  loadTasks: () => {
    const tasks = getTasksFromDB();
    set({ tasks });
  },

  addTask: async (task) => {
    const id = addTaskToDB(task as Task);
    if (task.isReminderActive && task.isCompleted === 0) {
      await scheduleTaskNotifications(id, task.title, task.deadline);
    }
    get().loadTasks();
  },

  updateTask: async (task) => {
    updateTaskInDB(task);
    if (task.isReminderActive && task.isCompleted === 0) {
      await scheduleTaskNotifications(task.id!, task.title, task.deadline);
    } else {
      await cancelTaskNotifications(task.id!);
    }
    get().loadTasks();
  },

  deleteTask: async (id) => {
    deleteTaskFromDB(id);
    await cancelTaskNotifications(id);
    get().loadTasks();
  },

  toggleTaskCompletion: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (task) {
      const updatedTask = { ...task, isCompleted: task.isCompleted === 1 ? 0 : 1 };
      updateTaskInDB(updatedTask);

      if (updatedTask.isCompleted === 1) {
        // Cancel notifications if completed
        await cancelTaskNotifications(id);
      } else if (updatedTask.isReminderActive === 1) {
        // Reschedule if uncompleted and reminder was active
        await scheduleTaskNotifications(id, updatedTask.title, updatedTask.deadline);
      }

      get().loadTasks();
    }
  },
}));
