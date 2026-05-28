export type ColumnId = 'todo' | 'in-progress' | 'done';

export type TagColor =
  | 'blue'
  | 'green'
  | 'red'
  | 'yellow'
  | 'purple'
  | 'pink'
  | 'indigo'
  | 'orange';

export interface Tag {
  id: string;
  text: string;
  color: TagColor;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  tags: Tag[];
  dueDate: string;
  status: ColumnId;
  sortOrder: number;
  createdAt: string;
}

export interface Column {
  id: ColumnId;
  title: string;
}

export interface KanbanData {
  columns: Column[];
  cards: Card[];
}

/** Raw row shape returned by the Supabase tasks table. */
export interface TaskRow {
  id: string;
  title: string;
  description: string;
  tags: Tag[];
  due_date: string;
  status: ColumnId;
  sort_order: number;
  created_at: string;
}

/** Map snake_case DB row → camelCase Card. */
export function rowToCard(row: TaskRow): Card {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    tags: row.tags ?? [],
    dueDate: row.due_date ?? '',
    status: row.status,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
  };
}

export const TAG_COLOR_MAP: Record<TagColor, string> = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  purple: 'bg-purple-100 text-purple-700',
  pink: 'bg-pink-100 text-pink-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  orange: 'bg-orange-100 text-orange-700',
};

export const TAG_COLORS: TagColor[] = [
  'blue',
  'green',
  'red',
  'yellow',
  'purple',
  'pink',
  'indigo',
  'orange',
];
