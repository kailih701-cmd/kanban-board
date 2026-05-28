import { supabase } from './lib/supabase';
import type { Card, Column, ColumnId, TaskRow } from './types';
import { rowToCard } from './types';

// ─── Columns (static) ──────────────────────────────────

const COLUMNS: Column[] = [
  { id: 'todo', title: '待处理' },
  { id: 'in-progress', title: '进行中' },
  { id: 'done', title: '已完成' },
];

export function getColumns(): Column[] {
  return COLUMNS;
}

// ─── Cards CRUD ────────────────────────────────────────

export async function fetchCards(): Promise<Card[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data as TaskRow[]).map(rowToCard);
}

export async function createCard(
  card: Omit<Card, 'id' | 'createdAt' | 'sortOrder'>
): Promise<Card> {
  // Compute next sort_order for the target status column
  const { data: maxRow } = await supabase
    .from('tasks')
    .select('sort_order')
    .eq('status', card.status)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = maxRow ? (maxRow as { sort_order: number }).sort_order + 1 : 0;

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: card.title,
      description: card.description,
      tags: card.tags,
      due_date: card.dueDate || null,
      status: card.status,
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToCard(data as TaskRow);
}

export async function updateCard(
  id: string,
  updates: Partial<Omit<Card, 'id' | 'createdAt'>>
): Promise<Card> {
  const payload: Record<string, unknown> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.tags !== undefined) payload.tags = updates.tags;
  if (updates.dueDate !== undefined) payload.due_date = updates.dueDate || null;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;

  const { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return rowToCard(data as TaskRow);
}

export async function deleteCard(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

/** Move a card to a different status column, placing it at the end. */
export async function moveCard(cardId: string, newStatus: ColumnId): Promise<Card> {
  // Get current max sort_order for the target column
  const { data: maxRow } = await supabase
    .from('tasks')
    .select('sort_order')
    .eq('status', newStatus)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = maxRow ? (maxRow as { sort_order: number }).sort_order + 1 : 0;

  return updateCard(cardId, { status: newStatus, sortOrder: nextOrder });
}
