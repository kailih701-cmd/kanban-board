import type { KanbanData, Column } from '../types';

const STORAGE_KEY = 'kanban-board-data';

const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', title: '待处理' },
  { id: 'in-progress', title: '进行中' },
  { id: 'done', title: '已完成' },
];

function getDefaultData(): KanbanData {
  return {
    columns: DEFAULT_COLUMNS,
    cards: [],
  };
}

export function loadData(): KanbanData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    const data = JSON.parse(raw) as KanbanData;
    // Basic validation
    if (!data.columns || !Array.isArray(data.cards)) return getDefaultData();
    return data;
  } catch {
    return getDefaultData();
  }
}

export function saveData(data: KanbanData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData(): KanbanData {
  const data = getDefaultData();
  saveData(data);
  return data;
}
