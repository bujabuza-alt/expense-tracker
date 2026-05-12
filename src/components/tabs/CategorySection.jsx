/*
 * ================================================================
 * 업데이트 이력 (Update History)
 * ================================================================
 * v1.0.0 (2026-05-12)
 *   - 카테고리 관리 섹션 최초 구현
 *   - @dnd-kit/core, @dnd-kit/sortable 기반 드래그 앤 드롭 순서 변경 구현
 *     · PointerSensor (마우스/트랙패드): 5px 이동 후 드래그 시작
 *     · TouchSensor (모바일 터치): 150ms 롱프레스 후 드래그 시작
 *     · KeyboardSensor: 접근성 키보드 탐색 지원
 *   - 카테고리 추가·편집(인라인)·삭제 CRUD 기능 구현
 *   - onRename 콜백으로 연관 지출 항목 이름 일괄 반영 (반응형 리네임)
 *   - 중복 카테고리 이름 추가 방지 (대소문자 구분)
 *   - 드래그 중 아이템 반투명 처리로 시각적 피드백 제공
 * ================================================================
 */

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, Check, X, Pencil, GripVertical, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { uid } from '../../utils';

// ── 드래그 오버레이용 정적 아이템 (드래그 중 커서에 따라다니는 복사본) ──
function CategoryItemGhost({ name }) {
  return (
    <li className="flex items-center justify-between p-3 bg-gray-700 rounded-xl shadow-2xl ring-1 ring-violet-500/50">
      <GripVertical className="w-4 h-4 text-violet-400 mr-2 shrink-0" />
      <span className="flex-1 text-sm text-gray-100 font-medium">{name}</span>
    </li>
  );
}

// ── 드래그 가능한 개별 카테고리 아이템 ──────────────────────────────
function SortableCategoryItem({
  category,
  isEditing,
  editDraft,
  onEditChange,
  onEditSave,
  onEditCancel,
  onStartEdit,
  onDelete,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  // 드래그 중이면 원본 아이템을 투명하게 처리 (오버레이가 따라다님)
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity:   isDragging ? 0 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="bg-gray-800 rounded-xl overflow-hidden"
    >
      {isEditing ? (
        /* 인라인 편집 폼 */
        <div className="flex items-center gap-2 p-3">
          <input
            autoFocus
            type="text"
            value={editDraft}
            onChange={e => onEditChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter')  onEditSave();
              if (e.key === 'Escape') onEditCancel();
            }}
            className="flex-1 bg-gray-700 border border-gray-600 focus:border-violet-500 rounded-lg px-2.5 py-1.5 text-sm text-white outline-none transition-colors"
          />
          <button
            onClick={onEditSave}
            className="p-1.5 text-violet-400 hover:text-violet-300 transition-colors"
            aria-label="저장"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={onEditCancel}
            className="p-1.5 text-gray-600 hover:text-gray-400 transition-colors"
            aria-label="취소"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* 일반 표시 모드 */
        <div className="flex items-center justify-between px-3 py-3">
          {/* 드래그 핸들 — touch-none으로 스크롤과 충돌 방지 */}
          <button
            {...attributes}
            {...listeners}
            className="p-1 text-gray-600 hover:text-gray-400 touch-none cursor-grab active:cursor-grabbing mr-2 shrink-0"
            aria-label="드래그하여 순서 변경"
            tabIndex={-1}
          >
            <GripVertical className="w-4 h-4" />
          </button>

          <span className="flex-1 text-sm text-gray-200 font-medium truncate">
            {category.name}
          </span>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onStartEdit(category)}
              className="p-1.5 text-gray-600 hover:text-violet-400 transition-colors"
              aria-label="카테고리 이름 수정"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(category.id)}
              className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"
              aria-label="카테고리 삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

// ── 카테고리 관리 섹션 (메인) ────────────────────────────────────
export default function CategorySection({ categories, onUpdate, onRename }) {
  const [isOpen,     setIsOpen]     = useState(true);
  const [adding,     setAdding]     = useState(false);
  const [newName,    setNewName]    = useState('');
  const [editingId,  setEditingId]  = useState(null);
  const [editDraft,  setEditDraft]  = useState('');
  const [activeId,   setActiveId]   = useState(null); // 드래그 중인 아이템 id

  // dnd-kit 입력 센서 설정
  const sensors = useSensors(
    // 마우스·트랙패드: 5px 이상 이동해야 드래그로 인식 (클릭과 구분)
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    // 모바일 터치: 150ms 롱프레스 후 드래그 시작 (스크롤과 구분)
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    // 키보드 접근성 지원
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 드래그 시작 — 오버레이 렌더링을 위해 activeId 저장
  const handleDragStart = ({ active }) => setActiveId(active.id);

  // 드래그 종료 — 배열 순서 업데이트 후 상태 초기화
  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIdx = categories.findIndex(c => c.id === active.id);
    const newIdx = categories.findIndex(c => c.id === over.id);
    onUpdate(arrayMove(categories, oldIdx, newIdx));
  };

  const handleDragCancel = () => setActiveId(null);

  // 새 카테고리 추가 — 빈 이름·중복 방지
  const addCategory = () => {
    const v = newName.trim();
    if (!v) return;
    if (categories.some(c => c.name === v)) return;
    onUpdate([...categories, { id: uid(), name: v }]);
    setNewName('');
    setAdding(false);
  };

  // 편집 시작
  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditDraft(cat.name);
  };

  // 편집 저장 — 변경이 있으면 onRename으로 지출 항목도 일괄 업데이트
  const saveEdit = () => {
    const v = editDraft.trim();
    if (!v || !editingId) { setEditingId(null); return; }
    const target = categories.find(c => c.id === editingId);
    if (!target) { setEditingId(null); return; }
    if (target.name !== v) {
      // 카테고리 목록 + 연관 지출 항목 동시 업데이트
      onRename(target.name, v);
    }
    setEditingId(null);
  };

  // 카테고리 삭제
  const deleteCategory = (id) => onUpdate(categories.filter(c => c.id !== id));

  // 드래그 오버레이에 표시할 아이템
  const draggedCategory = activeId ? categories.find(c => c.id === activeId) : null;
  const categoryIds     = categories.map(c => c.id);

  return (
    <section className="bg-gray-900 rounded-2xl p-4 space-y-3">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(o => !o)}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          <Tag className="w-4 h-4 text-violet-400 shrink-0" />
          <h3 className="text-sm font-bold text-gray-200">카테고리 관리</h3>
          {isOpen
            ? <ChevronUp   className="w-3.5 h-3.5 text-gray-500 ml-1" />
            : <ChevronDown className="w-3.5 h-3.5 text-gray-500 ml-1" />}
        </button>
        <button
          onClick={() => { setAdding(a => !a); setNewName(''); }}
          className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 bg-violet-900/30 hover:bg-violet-900/50 px-2.5 py-1.5 rounded-lg transition-all shrink-0"
        >
          <Plus className="w-3 h-3" />
          추가
        </button>
      </div>

      {/* 새 카테고리 입력 폼 */}
      {isOpen && adding && (
        <div className="flex gap-2">
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter')  addCategory();
              if (e.key === 'Escape') { setAdding(false); setNewName(''); }
            }}
            placeholder="새 카테고리 이름"
            className="flex-1 bg-gray-800 border border-gray-700 focus:border-violet-500 rounded-xl px-3 py-2 text-sm text-white outline-none transition-colors placeholder-gray-600"
          />
          <button
            onClick={addCategory}
            className="p-2 text-violet-400 hover:text-violet-300 transition-colors"
            aria-label="추가 확인"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setAdding(false); setNewName(''); }}
            className="p-2 text-gray-600 hover:text-gray-400 transition-colors"
            aria-label="추가 취소"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 카테고리 목록 (드래그 앤 드롭) */}
      {isOpen && (
        categories.length === 0 ? (
          <div className="text-center py-6 text-gray-600 text-xs">
            카테고리를 추가해보세요
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext items={categoryIds} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2">
                {categories.map(cat => (
                  <SortableCategoryItem
                    key={cat.id}
                    category={cat}
                    isEditing={editingId === cat.id}
                    editDraft={editDraft}
                    onEditChange={setEditDraft}
                    onEditSave={saveEdit}
                    onEditCancel={() => setEditingId(null)}
                    onStartEdit={startEdit}
                    onDelete={deleteCategory}
                  />
                ))}
              </ul>
            </SortableContext>

            {/* 드래그 중 커서에 표시되는 고스트 아이템 */}
            <DragOverlay>
              {draggedCategory && <CategoryItemGhost name={draggedCategory.name} />}
            </DragOverlay>
          </DndContext>
        )
      )}

      {isOpen && (
        <p className="text-[10px] text-gray-600 text-center pt-0.5">
          길게 누르거나 드래그하여 순서를 변경할 수 있습니다
        </p>
      )}
    </section>
  );
}
