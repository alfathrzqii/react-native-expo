import { create } from 'zustand';
import {
  Task,
  TaskNotification,
  getTasksFromDB,
  addTaskToDB,
  updateTaskInDB,
  deleteTaskFromDB,
  addNotificationToDB,
  deleteAllNotificationsForTask,
  getNotificationsByTaskId,
  deleteNotificationFromDB,
  getNotificationById,
} from '../database/db';
import { scheduleTaskNotifications, cancelTaskNotifications } from '../utils/notifications';

interface TaskState {
  tasks: Task[];
  loadTasks: () => void;
  addTask: (task: Omit<Task, 'id'>, notifications: Omit<TaskNotification, 'id' | 'taskId'>[]) => Promise<void>;
  updateTask: (task: Task, notifications?: TaskNotification[]) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  toggleTaskCompletion: (id: number) => Promise<void>;
  getNotifications: (taskId: number) => TaskNotification[];
  addSingleNotification: (taskId: number, notification: Omit<TaskNotification, 'id' | 'taskId'>) => Promise<void>;
  deleteSingleNotification: (id: number) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],

  loadTasks: () => {
    const tasks = getTasksFromDB();
    set({ tasks });
  },

  addTask: async (task, notifications) => {
    const taskId = addTaskToDB(task as Task);

    // Save all notifications to DB
    for (const notif of notifications) {
      addNotificationToDB({ ...notif, taskId });
    }

    if (task.isCompleted === 0) {
      const dbNotifications = getNotificationsByTaskId(taskId);
      await scheduleTaskNotifications(taskId, task.deadline, dbNotifications);
    }

    get().loadTasks();
  },

  updateTask: async (task, notifications) => {
    updateTaskInDB(task);

    if (notifications !== undefined) {
       // Replace existing notifications
       deleteAllNotificationsForTask(task.id!);
       for (const notif of notifications) {
         addNotificationToDB({ ...notif, taskId: task.id! });
       }
    }

    if (task.isCompleted === 0) {
      const dbNotifications = getNotificationsByTaskId(task.id!);
      await scheduleTaskNotifications(task.id!, task.deadline, dbNotifications);
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
      const isNowCompleted = task.isCompleted === 1 ? 0 : 1;
      const completedAt = isNowCompleted ? new Date().toISOString() : null;
      const updatedTask = {
        ...task,
        isCompleted: isNowCompleted,
        completedAt: completedAt
      };
      updateTaskInDB(updatedTask);

      if (updatedTask.isCompleted === 1) {
        // Cancel notifications if completed
        await cancelTaskNotifications(id);
      } else {
        // Reschedule if uncompleted
        const dbNotifications = getNotificationsByTaskId(id);
        await scheduleTaskNotifications(id, updatedTask.deadline, dbNotifications);
      }

      get().loadTasks();
    }
  },

  getNotifications: (taskId) => {
    return getNotificationsByTaskId(taskId);
  },

  addSingleNotification: async (taskId, notification) => {
    addNotificationToDB({ ...notification, taskId });
    const task = get().tasks.find((t) => t.id === taskId);
    if (task && task.isCompleted === 0) {
       const dbNotifications = getNotificationsByTaskId(taskId);
       await scheduleTaskNotifications(taskId, task.deadline, dbNotifications);
    }
  },

  deleteSingleNotification: async (id) => {
    const notif = getNotificationById(id);
    if (notif) {
      const taskId = notif.taskId!;
      deleteNotificationFromDB(id);
      const task = get().tasks.find((t) => t.id === taskId);
      if (task && task.isCompleted === 0) {
        const remainingNotifs = getNotificationsByTaskId(taskId);
        await scheduleTaskNotifications(taskId, task.deadline, remainingNotifs);
      }
    }
  }
}));
