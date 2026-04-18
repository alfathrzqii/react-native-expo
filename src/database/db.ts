import * as SQLite from 'expo-sqlite';

export interface Task {
  id?: number;
  title: string;
  description: string;
  deadline: string; // ISO 8601 string
  category: string;
  priority: number;
  isReminderActive: number; // 0 or 1
  isCompleted: number; // 0 or 1
  createdAt?: string; // ISO 8601 string
  completedAt?: string | null; // ISO 8601 string
}

export interface TaskNotification {
  id?: number;
  taskId?: number;
  title: string;
  description: string;
  type: 'relative' | 'absolute';
  offsetMinutes: number; // Used if type === 'relative'. Can be 0.
  scheduledDate: string | null; // ISO 8601 string, Used if type === 'absolute'
}

export interface Category {
  id?: number;
  name: string;
}

const db = SQLite.openDatabaseSync('remindy.db');

export const initDB = () => {
  db.execSync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      deadline TEXT NOT NULL,
      category TEXT NOT NULL,
      priority INTEGER NOT NULL,
      isReminderActive INTEGER NOT NULL DEFAULT 0,
      isCompleted INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT,
      completedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS task_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      taskId INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      offsetMinutes INTEGER NOT NULL DEFAULT 0,
      scheduledDate TEXT,
      FOREIGN KEY(taskId) REFERENCES tasks(id) ON DELETE CASCADE
    );
  `);

  // Migration: Add new columns to existing tasks table if they don't exist
  const tableInfo = db.getAllSync(`PRAGMA table_info(tasks)`) as any[];
  const columnNames = tableInfo.map((info) => info.name);

  const nowISO = new Date().toISOString();

  if (!columnNames.includes('createdAt')) {
    db.execSync(`ALTER TABLE tasks ADD COLUMN createdAt TEXT`);
    db.runSync(`UPDATE tasks SET createdAt = ?`, nowISO);
  }

  if (!columnNames.includes('completedAt')) {
    db.execSync(`ALTER TABLE tasks ADD COLUMN completedAt TEXT`);
    // Set completedAt to current time for tasks that are already completed, otherwise null
    db.runSync(`UPDATE tasks SET completedAt = ? WHERE isCompleted = 1`, nowISO);
  }

  // Seed default categories if table is empty
  const categoryCountResult = db.getFirstSync('SELECT COUNT(*) as count FROM categories') as { count: number };
  if (categoryCountResult && categoryCountResult.count === 0) {
    const defaultCategories = ['Tugas', 'Ujian', 'Proyek'];
    for (const cat of defaultCategories) {
      db.runSync('INSERT INTO categories (name) VALUES (?)', cat);
    }
  }
};

// Initialize DB immediately at module level so it's ready before any component mounts
initDB();

export const addTaskToDB = (task: Task) => {
  const createdAt = task.createdAt || new Date().toISOString();
  const completedAt = task.isCompleted ? (task.completedAt || new Date().toISOString()) : null;

  const result = db.runSync(
    'INSERT INTO tasks (title, description, deadline, category, priority, isReminderActive, isCompleted, createdAt, completedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    task.title,
    task.description,
    task.deadline,
    task.category,
    task.priority,
    task.isReminderActive,
    task.isCompleted,
    createdAt,
    completedAt
  );
  return result.lastInsertRowId;
};

export const updateTaskInDB = (task: Task) => {
  db.runSync(
    'UPDATE tasks SET title = ?, description = ?, deadline = ?, category = ?, priority = ?, isReminderActive = ?, isCompleted = ?, createdAt = ?, completedAt = ? WHERE id = ?',
    task.title,
    task.description,
    task.deadline,
    task.category,
    task.priority,
    task.isReminderActive,
    task.isCompleted,
    task.createdAt || null,
    task.completedAt || null,
    task.id!
  );
};

export const deleteTaskFromDB = (id: number) => {
  db.runSync('DELETE FROM tasks WHERE id = ?', id);
};

export const getTasksFromDB = (): Task[] => {
  const allRows = db.getAllSync('SELECT * FROM tasks ORDER BY deadline ASC') as any[];
  return allRows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    deadline: row.deadline,
    category: row.category,
    priority: row.priority,
    isReminderActive: row.isReminderActive,
    isCompleted: row.isCompleted,
    createdAt: row.createdAt,
    completedAt: row.completedAt,
  }));
};

export const addNotificationToDB = (notification: TaskNotification) => {
  const result = db.runSync(
    'INSERT INTO task_notifications (taskId, title, description, type, offsetMinutes, scheduledDate) VALUES (?, ?, ?, ?, ?, ?)',
    notification.taskId!,
    notification.title,
    notification.description,
    notification.type,
    notification.offsetMinutes,
    notification.scheduledDate
  );
  return result.lastInsertRowId;
};

export const getNotificationsByTaskId = (taskId: number): TaskNotification[] => {
  const allRows = db.getAllSync('SELECT * FROM task_notifications WHERE taskId = ?', taskId) as any[];
  return allRows.map((row) => ({
    id: row.id,
    taskId: row.taskId,
    title: row.title,
    description: row.description,
    type: row.type,
    offsetMinutes: row.offsetMinutes,
    scheduledDate: row.scheduledDate,
  }));
};

export const getNotificationById = (id: number): TaskNotification | null => {
  const row = db.getFirstSync('SELECT * FROM task_notifications WHERE id = ?', id) as any;
  if (!row) return null;
  return {
    id: row.id,
    taskId: row.taskId,
    title: row.title,
    description: row.description,
    type: row.type,
    offsetMinutes: row.offsetMinutes,
    scheduledDate: row.scheduledDate,
  };
};

export const deleteNotificationFromDB = (id: number) => {
  db.runSync('DELETE FROM task_notifications WHERE id = ?', id);
};

export const deleteAllNotificationsForTask = (taskId: number) => {
  db.runSync('DELETE FROM task_notifications WHERE taskId = ?', taskId);
};

export const getCategoriesFromDB = (): Category[] => {
  const allRows = db.getAllSync('SELECT * FROM categories ORDER BY id ASC') as any[];
  return allRows.map((row) => ({
    id: row.id,
    name: row.name,
  }));
};

export const addCategoryToDB = (name: string): number => {
  const result = db.runSync('INSERT OR IGNORE INTO categories (name) VALUES (?)', name);
  return result.lastInsertRowId;
};

export const deleteCategoryFromDB = (id: number) => {
  db.runSync('DELETE FROM categories WHERE id = ?', id);
};
