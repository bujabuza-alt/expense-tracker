import { Check, X } from 'lucide-react';
import { fmt } from '../utils';

export default function BudgetCard({
  budget, monthTotal,
  editingBudget, budgetDraft,
  onEditStart, onDraftChange, onSave, onCancel,
}) {
  const pct      = budget > 0 ? Math.min((monthTotal / budget) * 100, 100) : 0;
  const barColor = pct < 60 ? 'bg-emerald-500' : pct < 85 ? 'bg-amber-400' : 'bg-red-500';

  return (
    <section className="bg-gray-900 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">월 예산</span>
        {editingBudget ? (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              type="text"
              inputMode="numeric"
              value={budgetDraft}
              onChange={e => onDraftChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter')  onSave();
                if (e.key === 'Escape') onCancel();
              }}
              className="w-28 bg-gray-800 text-right text-sm px-2 py-1 rounded-lg border border-gray-700 focus:border-violet-500 outline-none text-white"
            />
            <button onClick={onSave}   className="text-violet-400 hover:text-violet-300 transition-colors">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={onCancel} className="text-gray-600 hover:text-gray-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onEditStart}
            className="text-sm font-bold text-violet-400 hover:text-violet-300 transition-colors"
          >
            ₩{fmt(budget)}
          </button>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-black">₩{fmt(monthTotal)}</span>
        <span className="text-xs text-gray-500">{pct.toFixed(1)}% 사용</span>
      </div>

      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {monthTotal > budget && budget > 0 && (
        <p className="text-xs font-semibold text-red-400">
          ⚠ 예산 초과 — ₩{fmt(monthTotal - budget)} 더 사용했습니다
        </p>
      )}
    </section>
  );
}
