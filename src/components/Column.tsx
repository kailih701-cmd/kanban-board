import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Column as ColumnType, Card } from '../types';
import { CardItem } from './Card';

interface ColumnProps {
  column: ColumnType;
  cards: Card[];
  onOpenCreate: () => void;
  onOpenEdit: (card: Card) => void;
  onDeleteCard: (id: string) => void;
}

const columnColors: Record<string, string> = {
  todo: 'border-t-slate-400',
  'in-progress': 'border-t-blue-500',
  done: 'border-t-emerald-500',
};

const columnDotColors: Record<string, string> = {
  todo: 'bg-slate-400',
  'in-progress': 'bg-blue-500',
  done: 'bg-emerald-500',
};

export function Column({
  column,
  cards,
  onOpenCreate,
  onOpenEdit,
  onDeleteCard,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-shrink-0 w-80 flex flex-col rounded-xl border-t-2 shadow-sm
        transition-colors duration-150
        ${columnColors[column.id]}
        ${isOver ? 'bg-blue-50/70 ring-2 ring-blue-200' : 'bg-white/80'}
      `}
    >
      {/* Column header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${columnDotColors[column.id]}`}
          />
          <h2 className="text-sm font-semibold text-slate-700">
            {column.title}
          </h2>
          <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full font-medium">
            {cards.length}
          </span>
        </div>
        <button
          onClick={onOpenCreate}
          className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400
                     hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="添加任务"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Card list */}
      <div className="px-3 pb-3 flex flex-col gap-2 min-h-[120px]">
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onEdit={onOpenEdit}
              onDelete={onDeleteCard}
            />
          ))}
        </SortableContext>

        {cards.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-8">
            <p className="text-sm text-slate-400">暂无任务</p>
          </div>
        )}
      </div>
    </div>
  );
}
