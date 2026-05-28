import { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import type { Card, ColumnId, KanbanData } from './types';
import type { Column as ColumnType } from './types';
import {
  getColumns,
  fetchCards,
  createCard,
  updateCard,
  deleteCard,
  moveCard,
} from './store';
import { Column } from './components/Column';
import { CardItem } from './components/Card';
import { CardModal } from './components/CardModal';

export default function App() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [targetColumnId, setTargetColumnId] = useState<ColumnId>('todo');
  const [saving, setSaving] = useState(false);

  const columns: ColumnType[] = getColumns();

  // ─── Load from Supabase ────────────────────────────

  const loadCards = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchCards();
      setCards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const cardsByColumn = (colId: ColumnId): Card[] =>
    cards.filter((c: Card) => c.status === colId);

  // ─── Card CRUD ────────────────────────────────────

  const openCreate = (colId: ColumnId) => {
    setEditingCard(null);
    setTargetColumnId(colId);
    setModalOpen(true);
  };

  const openEdit = (card: Card) => {
    setEditingCard(card);
    setTargetColumnId(card.status);
    setModalOpen(true);
  };

  const saveCard = async (
    cardData: Omit<Card, 'id' | 'createdAt' | 'sortOrder'> & { id?: string; createdAt?: string }
  ) => {
    setSaving(true);
    try {
      if (cardData.id) {
        // Update
        const updated = await updateCard(cardData.id, {
          title: cardData.title,
          description: cardData.description,
          tags: cardData.tags,
          dueDate: cardData.dueDate,
          status: targetColumnId,
        });
        setCards((prev: Card[]) => prev.map((c: Card) => (c.id === updated.id ? updated : c)));
      } else {
        // Create
        const created = await createCard({
          title: cardData.title,
          description: cardData.description,
          tags: cardData.tags,
          dueDate: cardData.dueDate,
          status: targetColumnId,
        });
        setCards((prev: Card[]) => [...prev, created]);
      }
      setModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCard(id);
      setCards((prev: Card[]) => prev.filter((c: Card) => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    }
  };

  // ─── Drag & Drop ──────────────────────────────────

  const handleDragStart = (event: DragStartEvent) => {
    const card = cards.find((c: Card) => c.id === event.active.id);
    if (card) setActiveCard(card);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const cardId = active.id as string;
    const card = cards.find((c: Card) => c.id === cardId);
    if (!card) return;

    // Determine target column
    let targetCol: ColumnId;
    const overCard = cards.find((c: Card) => c.id === over.id);
    if (overCard) {
      targetCol = overCard.status;
    } else if (['todo', 'in-progress', 'done'].includes(over.id as string)) {
      targetCol = over.id as ColumnId;
    } else {
      return;
    }

    if (card.status === targetCol) return;

    // Optimistic update
    setCards((prev: Card[]) =>
      prev.map((c: Card) => (c.id === cardId ? { ...c, status: targetCol } : c))
    );

    try {
      await moveCard(cardId, targetCol);
    } catch {
      // Revert on failure
      setCards((prev: Card[]) =>
        prev.map((c: Card) => (c.id === cardId ? { ...c, status: card.status } : c))
      );
    }
  };

  const handleDragCancel = () => {
    setActiveCard(null);
  };

  // ─── Render ───────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500">加载中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="text-center">
          <p className="text-red-500 mb-3">加载失败: {error}</p>
          <button
            onClick={loadCards}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-700"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
            看板
          </h1>
          <span className="text-sm text-slate-400">
            {cards.length} 个任务
          </span>
        </div>
      </header>

      {/* Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex gap-6 items-start overflow-x-auto pb-8">
            {columns.map((col: ColumnType) => (
              <Column
                key={col.id}
                column={col}
                cards={cardsByColumn(col.id)}
                onOpenCreate={() => openCreate(col.id)}
                onOpenEdit={openEdit}
                onDeleteCard={handleDelete}
              />
            ))}
          </div>
        </main>

        <DragOverlay>
          {activeCard ? (
            <div className="rotate-2 opacity-90">
              <CardItem card={activeCard} isDragOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Card Modal */}
      <CardModal
        open={modalOpen}
        card={editingCard}
        defaultColumnId={targetColumnId}
        onClose={() => setModalOpen(false)}
        onSave={saveCard}
        onColumnChange={setTargetColumnId}
        saving={saving}
      />
    </div>
  );
}
