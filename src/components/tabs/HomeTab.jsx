import BudgetCard   from '../BudgetCard';
import CalendarView from '../CalendarView';
import DailyPanel   from '../DailyPanel';
import { fmt }      from '../../utils';

export default function HomeTab({
  // 예산 관련
  budget, monthTotal,
  editingBudget, budgetDraft,
  onEditBudgetStart, onBudgetDraftChange, onSaveBudget, onCancelBudgetEdit,
  // 캘린더 관련
  year, month, calDays, dayTotals, selDate, today,
  onPrev, onNext, onSelectDate,
  // 프리셋 관련
  presets, onAddPreset,
  // 일별 지출 패널
  selExpenses, onOpenAddModal, onDeleteExpense,
}) {
  return (
    <div className="space-y-4">
      {/* 예산 카드 */}
      <BudgetCard
        budget={budget}
        monthTotal={monthTotal}
        editingBudget={editingBudget}
        budgetDraft={budgetDraft}
        onEditStart={onEditBudgetStart}
        onDraftChange={onBudgetDraftChange}
        onSave={onSaveBudget}
        onCancel={onCancelBudgetEdit}
      />

      {/* 빠른 추가 프리셋 버튼 목록 */}
      <section className="space-y-2">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          빠른 추가 → {selDate ?? '오늘'}
        </p>
        <div className="flex gap-2 flex-wrap">
          {presets.map(p => (
            <button
              key={p.id}
              onClick={() => onAddPreset(p)}
              className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 active:scale-95 border border-gray-800 hover:border-violet-700 rounded-xl px-3 py-2 text-xs transition-all"
            >
              <span>{p.emoji}</span>
              <span className="text-gray-300">{p.name}</span>
              <span className="text-violet-400 font-bold">₩{fmt(p.amount)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 캘린더 */}
      <CalendarView
        year={year} month={month}
        calDays={calDays} dayTotals={dayTotals}
        selDate={selDate} today={today}
        onPrev={onPrev} onNext={onNext}
        onSelectDate={onSelectDate}
      />

      {/* 선택 날짜 지출 패널 */}
      {selDate && (
        <DailyPanel
          selDate={selDate}
          selExpenses={selExpenses}
          onAddExpense={onOpenAddModal}
          onDeleteExpense={onDeleteExpense}
        />
      )}
    </div>
  );
}
