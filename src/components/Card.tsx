import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card } from '../types';
import { TAG_COLOR_MAP } from '../types';

interface CardItemProps {
  card: Card;
  isDragOverlay?: boolean;
  onEdit?: (card: Card) => void;
  onDelete?: (id: string) => void;
}

export function CardItem({ card, isDragOverlay, onEdit, onDelete }: CardItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled: isDragOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isOverdue =
    card.dueDate && new Date(card.dueDate) < new Date() && card.columnId !== 'done';

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(card);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个任务吗？')) {
      onDelete?.(card.id);
    }
  };

  const cardContent = (
    <div
      className="group relative bg-white rounded-lg border border-slate-200 p-3
                 shadow-sm hover:shadow-md hover:border-slate-300
                 transition-all duration-150 cursor-default"
    >
      {/* Drag handle */}
      <div
        className="absolute top-0 left-0 right-0 h-7 cursor-grab active:cursor-grabbing
                   flex items-center justify-center opacity-0 group-hover:opacity-100
                   transition-opacity rounded-t-lg"
        style={{ background: 'linear-gradient(to bottom, rgba(241,245,249,0.8), transparent)' }}
      >
        <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="9" cy="5" r="1.5" />
          <circle cx="15" cy="5" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
        </svg>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-800 mb-1.5 pr-6 mt-1">
        {card.title}
      </h3>

      {/* Description */}
      {card.description && (
        <p className="text-xs text-slate-500 mb-2.5 line-clamp-2 leading-relaxed">
          {card.description}
        </p>
      )}

      {/* Tags */}
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {card.tags.map((tag) => (
            <span
              key={tag.id}
              className={`text-[11px] px-1.5 py-0.5 rounded-md font-medium ${TAG_COLOR_MAP[tag.color]}`}
            >
              {tag.text}
            </span>
          ))}
        </div>
      )}

      {/* Due date */}
      {card.dueDate && (
        <div
          className={`flex items-center gap-1 text-[11px] font-medium ${
            isOverdue ? 'text-red-500' : 'text-slate-400'
          }`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{new Date(card.dueDate).toLocaleDateString('zh-CN')}</span>
          {isOverdue && <span className="text-red-400">(已逾期)</span>}
        </div>
      )}

      {/* Action buttons */}
      {!isDragOverlay && (
        <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEdit}
            className="w-6 h-6 flex items-center justify-center rounded-md
                       text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="编辑"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="w-6 h-6 flex items-center justify-center rounded-md
                       text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="删除"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );

  if (isDragOverlay) return cardContent;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {cardContent}
    </div>
  );
}
