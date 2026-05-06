import BudgetCard   from '../BudgetCard';
import CalendarView from '../CalendarView';
import DailyPanel   from '../DailyPanel';

// 업데이트 이력:
// - 메인 화면에서 '빠른 지출' 프리셋 버튼 섹션 제거 (FAB의 빠른 추가 기능으로 대체)
// - presets / onAddPreset 프롭 제거
export default function HomeTab({
  // 예산 관련
  budget, monthTotal,
  editingBudget, budgetDraft,
  onEditBudgetStart, onBudgetDraftChange, onSaveBudget, onCancelBudgetEdit,
  // 캘린더 관련
  year, month, calDays, dayTotals, selDate, today,
  onPrev, onNext, onSelectDate,
  // 일별 지출 패널
  selExpenses, onOpenAddModal, onDeleteExpense, onEditExpense,
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
          onEditExpense={onEditExpense}
        />
      )}
    </div>
  );
}
