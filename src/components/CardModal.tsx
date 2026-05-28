import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Card, ColumnId, Tag, TagColor } from '../types';
import { TAG_COLORS } from '../types';

interface CardModalProps {
  open: boolean;
  card: Card | null;
  defaultColumnId: ColumnId;
  onClose: () => void;
  onSave: (
    card: Omit<Card, 'id' | 'createdAt' | 'sortOrder'> & { id?: string; createdAt?: string }
  ) => void;
  onColumnChange: (colId: ColumnId) => void;
  saving?: boolean;
}

export function CardModal({
  open,
  card,
  defaultColumnId,
  onClose,
  onSave,
  onColumnChange,
  saving,
}: CardModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [columnId, setColumnId] = useState<ColumnId>(defaultColumnId);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description);
      setTags(card.tags);
      setDueDate(card.dueDate);
      setColumnId(card.status);
    } else {
      setTitle('');
      setDescription('');
      setTags([]);
      setDueDate('');
      setColumnId(defaultColumnId);
    }
  }, [card, defaultColumnId, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: card?.id,
      createdAt: card?.createdAt,
      title: title.trim(),
      description: description.trim(),
      tags,
      dueDate,
      status: columnId,
    });
  };

  const addTag = (color: TagColor) => {
    if (tags.length >= 8) return;
    const newTag: Tag = { id: uuidv4(), text: '', color };
    setTags([...tags, newTag]);
  };

  const removeTag = (id: string) => {
    setTags(tags.filter((t) => t.id !== id));
  };

  const updateTagText = (id: string, text: string) => {
    setTags(tags.map((t) => (t.id === id ? { ...t, text } : t)));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">
            {card ? '编辑任务' : '新建任务'}
          </h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors
                       disabled:opacity-40"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {/* Status select */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                所属列
              </label>
              <select
                value={columnId}
                onChange={(e) => {
                  setColumnId(e.target.value as ColumnId);
                  onColumnChange(e.target.value as ColumnId);
                }}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2
                           bg-white focus:outline-none focus:ring-2 focus:ring-blue-100
                           focus:border-blue-400 transition-shadow"
              >
                <option value="todo">待处理</option>
                <option value="in-progress">进行中</option>
                <option value="done">已完成</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                标题 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="任务标题"
                autoFocus
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2
                           placeholder:text-slate-300 focus:outline-none focus:ring-2
                           focus:ring-blue-100 focus:border-blue-400 transition-shadow"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                描述
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="任务描述（可选）"
                rows={3}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2
                           placeholder:text-slate-300 focus:outline-none focus:ring-2
                           focus:ring-blue-100 focus:border-blue-400 transition-shadow resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                标签
              </label>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <div key={tag.id} className="flex items-center gap-1">
                      <input
                        type="text"
                        value={tag.text}
                        onChange={(e) => updateTagText(tag.id, e.target.value)}
                        placeholder="标签名"
                        className="w-20 text-xs border border-slate-200 rounded-md px-2 py-1
                                   bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeTag(tag.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-1.5 flex-wrap">
                {TAG_COLORS.map((color) => {
                  const colorMap: Record<TagColor, string> = {
                    blue: 'bg-blue-400',
                    green: 'bg-green-400',
                    red: 'bg-red-400',
                    yellow: 'bg-yellow-400',
                    purple: 'bg-purple-400',
                    pink: 'bg-pink-400',
                    indigo: 'bg-indigo-400',
                    orange: 'bg-orange-400',
                  };
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => addTag(color)}
                      className={`w-6 h-6 rounded-full ${colorMap[color]}
                                  hover:scale-110 active:scale-95 transition-transform`}
                      title={color}
                    />
                  );
                })}
              </div>
            </div>

            {/* Due date */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                截止日期
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2
                           bg-white focus:outline-none focus:ring-2 focus:ring-blue-100
                           focus:border-blue-400 transition-shadow"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2.5 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border
                         border-slate-200 rounded-lg hover:bg-slate-50 transition-colors
                         disabled:opacity-40"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!title.trim() || saving}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-800
                         rounded-lg hover:bg-slate-700 disabled:opacity-40
                         disabled:cursor-not-allowed transition-colors"
            >
              {saving ? '保存中...' : card ? '保存' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
