import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import type { Card, ColumnId } from './types';
import type { Column as ColumnType } from './types';
import { loadData, saveData } from './store';
import { Column } from './components/Column';
import { CardItem } from './components/Card';
import { CardModal } from './components/CardModal';
import type { KanbanData } from './types';

export default function App() {
  const [data, setData] = useState<KanbanData>(loadData);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [targetColumnId, setTargetColumnId] = useState<ColumnId>('todo');

  const persist = useCallback((newData: KanbanData) => {
    setData(newData);
    saveData(newData);
  }, []);

  // Sensors: require 4px move before drag starts to avoid accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const cardsByColumn = (colId: ColumnId): Card[] =>
    data.cards.filter((c: Card) => c.columnId === colId);

  // ─── Card CRUD ────────────────────────────────────

  const openCreate = (colId: ColumnId) => {
    setEditingCard(null);
    setTargetColumnId(colId);
    setModalOpen(true);
  };

  const openEdit = (card: Card) => {
    setEditingCard(card);
    setTargetColumnId(card.columnId);
    setModalOpen(true);
  };

  const saveCard = (
    cardData: Omit<Card, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
  ) => {
    if (cardData.id && cardData.createdAt) {
      // Update existing
      const updated: Card[] = data.cards.map((c: Card) =>
        c.id === cardData.id ? { ...c, ...cardData, columnId: targetColumnId } : c
      );
      persist({ ...data, cards: updated });
    } else {
      // Create new
      const newCard: Card = {
        id: uuidv4(),
        title: cardData.title,
        description: cardData.description,
        tags: cardData.tags,
        dueDate: cardData.dueDate,
        columnId: targetColumnId,
        createdAt: new Date().toISOString(),
      };
      persist({ ...data, cards: [...data.cards, newCard] });
    }
    setModalOpen(false);
  };

  const deleteCard = (id: string) => {
    persist({ ...data, cards: data.cards.filter((c: Card) => c.id !== id) });
  };

  // ─── Drag & Drop ──────────────────────────────────

  const handleDragStart = (event: DragStartEvent) => {
    const card = data.cards.find((c: Card) => c.id === event.active.id);
    if (card) setActiveCard(card);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const cardId = active.id as string;
    const card = data.cards.find((c: Card) => c.id === cardId);
    if (!card) return;

    // Determine target column
    let targetCol: ColumnId;
    // If dropped over a card, move to that card's column
    const overCard = data.cards.find((c: Card) => c.id === over.id);
    if (overCard) {
      targetCol = overCard.columnId;
    } else if (['todo', 'in-progress', 'done'].includes(over.id as string)) {
      targetCol = over.id as ColumnId;
    } else {
      return;
    }

    if (card.columnId === targetCol) return;

    const updated: Card[] = data.cards.map((c: Card) =>
      c.id === cardId ? { ...c, columnId: targetCol } : c
    );
    persist({ ...data, cards: updated });
  };

  const handleDragCancel = () => {
    setActiveCard(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
            看板
          </h1>
          <span className="text-sm text-slate-400">
            {data.cards.length} 个任务
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
            {data.columns.map((col: ColumnType) => (
              <Column
                key={col.id}
                column={col}
                cards={cardsByColumn(col.id)}
                onOpenCreate={() => openCreate(col.id)}
                onOpenEdit={openEdit}
                onDeleteCard={deleteCard}
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
      />
    </div>
  );
}
