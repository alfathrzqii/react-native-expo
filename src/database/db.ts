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
}

const db = SQLite.openDatabaseSync('remindy.db');

export const initDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      deadline TEXT NOT NULL,
      category TEXT NOT NULL,
      priority INTEGER NOT NULL,
      isReminderActive INTEGER NOT NULL DEFAULT 0,
      isCompleted INTEGER NOT NULL DEFAULT 0
    );
  `);
};

// Initialize DB immediately at module level so it's ready before any component mounts
initDB();

export const addTaskToDB = (task: Task) => {
  const result = db.runSync(
    'INSERT INTO tasks (title, description, deadline, category, priority, isReminderActive, isCompleted) VALUES (?, ?, ?, ?, ?, ?, ?)',
    task.title,
    task.description,
    task.deadline,
    task.category,
    task.priority,
    task.isReminderActive,
    task.isCompleted
  );
  return result.lastInsertRowId;
};

export const updateTaskInDB = (task: Task) => {
  db.runSync(
    'UPDATE tasks SET title = ?, description = ?, deadline = ?, category = ?, priority = ?, isReminderActive = ?, isCompleted = ? WHERE id = ?',
    task.title,
    task.description,
    task.deadline,
    task.category,
    task.priority,
    task.isReminderActive,
    task.isCompleted,
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
  }));
};
