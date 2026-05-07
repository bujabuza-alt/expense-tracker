import { useState, useEffect, useMemo } from 'react';

import { DEFAULT_PAYMENT_METHODS, DEFAULT_PRESETS } from './constants';
import { TODAY, uid, ls }                           from './utils';
import { useTheme }                                 from './context/ThemeContext';

import Header          from './components/Header';
import BottomNav       from './components/BottomNav';
import FAB             from './components/FAB';
import AddExpenseModal from './components/AddExpenseModal';
import QuickAddModal   from './components/QuickAddModal';

import HomeTab     from './components/tabs/HomeTab';
import SearchTab   from './components/tabs/SearchTab';
import PaymentTab  from './components/tabs/PaymentTab';
import AnalysisTab from './components/tabs/AnalysisTab';
import SettingsTab from './components/tabs/SettingsTab';

// 업데이트 이력:
// - HomeTab에서 presets/onAddPreset 프롭 제거 (빠른 추가 섹션 제거에 따른 정리)
// - 지출 편집 기능 추가: editingExpense 상태, showEditModal 상태, editForm 상태 추가
// - updateExpense 핸들러 구현 (id 기준으로 기존 항목 교체)
// - openEditModal: 선택한 지출 데이터를 편집 폼에 사전 세팅
// - HomeTab, SearchTab 에 onEditExpense 프롭 전달
// - Japan 모드 테마 지원: ThemeContext 연동, data-theme 속성 적용, SettingsTab에 테마 제어 프롭 전달
// ================================================================
// 메인 앱 컴포넌트 — 전역 상태 관리 및 렌더 조율
// ================================================================
export default function App() {
  const now = new Date();
  const { theme, setTheme } = useTheme();

  // ── 캘린더 뷰 (연/월) ─────────────────────────────────────────
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed

  // ── 핵심 데이터 (로컬스토리지 초기화) ────────────────────────
  const [expenses,       setExpenses]       = useState(() => ls.get('et_expenses',        []));
  const [budget,         setBudget]         = useState(() => ls.get('et_budget',          500000));
  const [paymentMethods, setPaymentMethods] = useState(() => ls.get('et_payment_methods', DEFAULT_PAYMENT_METHODS));
  const [presets,        setPresets]        = useState(() => ls.get('et_presets',         DEFAULT_PRESETS));

  // ── 예산 편집 상태 ────────────────────────────────────────────
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetDraft,   setBudgetDraft]   = useState('');

  // ── 캘린더 선택 날짜 ──────────────────────────────────────────
  const [selDate, setSelDate] = useState(null);

  // ── 탭 내비게이션 ─────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('home');

  // ── FAB 및 모달 상태 ──────────────────────────────────────────
  const [fabOpen,        setFabOpen]        = useState(false);
  const [showAddModal,   setShowAddModal]   = useState(false);
  const [showQuickModal, setShowQuickModal] = useState(false);

  // ── 지출 추가 폼 ──────────────────────────────────────────────
  const [form, setForm] = useState({
    date:          TODAY,
    name:          '',
    amount:        '',
    paymentMethod: paymentMethods[0] ?? '',
  });

  // ── 지출 편집 상태 ────────────────────────────────────────────
  const [showEditModal,   setShowEditModal]   = useState(false);
  const [editingExpense,  setEditingExpense]  = useState(null);
  const [editForm,        setEditForm]        = useState({
    date:          '',
    name:          '',
    amount:        '',
    paymentMethod: '',
  });

  // ── 로컬스토리지 자동 동기화 ──────────────────────────────────
  useEffect(() => ls.set('et_expenses',        expenses),       [expenses]);
  useEffect(() => ls.set('et_budget',          budget),         [budget]);
  useEffect(() => ls.set('et_payment_methods', paymentMethods), [paymentMethods]);
  useEffect(() => ls.set('et_presets',         presets),        [presets]);

  // ── 계산값 (메모이제이션) ─────────────────────────────────────

  // 현재 뷰 월의 지출
  const monthExpenses = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return expenses.filter(e => e.date.startsWith(prefix));
  }, [expenses, year, month]);

  // 날짜별 지출 합계 맵
  const dayTotals = useMemo(() => {
    const map = {};
    monthExpenses.forEach(e => { map[e.date] = (map[e.date] || 0) + e.amount; });
    return map;
  }, [monthExpenses]);

  // 월 총 지출
  const monthTotal = useMemo(
    () => monthExpenses.reduce((s, e) => s + e.amount, 0),
    [monthExpenses]
  );

  // 캘린더 날짜 배열 (앞쪽 빈 칸 + 날짜 숫자)
  const calDays = useMemo(() => {
    const startDow    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return [
      ...Array(startDow).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
  }, [year, month]);

  // 선택된 날짜의 지출 목록
  const selExpenses = useMemo(
    () => (selDate ? expenses.filter(e => e.date === selDate) : []),
    [expenses, selDate]
  );

  // ── 이벤트 핸들러 ─────────────────────────────────────────────

  const goPrev = () => {
    setSelDate(null);
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };

  const goNext = () => {
    setSelDate(null);
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  // 지출 추가 모달 열기 (날짜 사전 세팅)
  const openAddModal = (date = TODAY) => {
    setForm({
      date,
      name:          '',
      amount:        '',
      paymentMethod: paymentMethods[0] ?? '',
    });
    setShowAddModal(true);
    setFabOpen(false);
  };

  // 새 지출 저장
  const addExpense = () => {
    const amount = parseFloat(form.amount);
    if (!form.name.trim() || isNaN(amount) || amount <= 0) return;
    setExpenses(prev => [...prev, {
      id:            uid(),
      date:          form.date,
      name:          form.name.trim(),
      amount,
      paymentMethod: form.paymentMethod,
    }]);
    setShowAddModal(false);
  };

  // 지출 편집 모달 열기 (기존 데이터 사전 세팅)
  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setEditForm({
      date:          expense.date,
      name:          expense.name,
      amount:        String(expense.amount),
      paymentMethod: expense.paymentMethod,
    });
    setShowEditModal(true);
  };

  // 지출 수정 저장 (id 기준으로 기존 항목 교체 후 즉시 반영)
  const updateExpense = () => {
    const amount = parseFloat(editForm.amount);
    if (!editForm.name.trim() || isNaN(amount) || amount <= 0) return;
    setExpenses(prev => prev.map(e =>
      e.id === editingExpense.id
        ? { ...e,
            date:          editForm.date,
            name:          editForm.name.trim(),
            amount,
            paymentMethod: editForm.paymentMethod,
          }
        : e
    ));
    setShowEditModal(false);
    setEditingExpense(null);
  };

  // 프리셋으로 즉시 추가 (선택 날짜 우선, 없으면 오늘)
  const addPreset = (preset) => {
    setExpenses(prev => [...prev, {
      id:            uid(),
      date:          selDate || TODAY,
      name:          preset.name,
      amount:        preset.amount,
      paymentMethod: preset.paymentMethod,
    }]);
  };

  const deleteExpense = (id) =>
    setExpenses(prev => prev.filter(e => e.id !== id));

  const saveBudget = () => {
    const val = parseFloat(budgetDraft.replace(/[^0-9.]/g, ''));
    if (!isNaN(val) && val >= 0) setBudget(val);
    setEditingBudget(false);
    setBudgetDraft('');
  };

  // FAB 메뉴 토글
  const handleFabToggle = () => setFabOpen(o => !o);

  const handleGeneralAdd = () => {
    setFabOpen(false);
    openAddModal(selDate || TODAY);
  };

  const handleQuickAdd = () => {
    setFabOpen(false);
    setShowQuickModal(true);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFabOpen(false);
  };

  // ── 렌더 ──────────────────────────────────────────────────────

  return (
    <div
      data-theme={theme}
      className="min-h-screen bg-gray-950 text-white"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* 스크롤 가능한 콘텐츠 영역 (바텀 내비+FAB 만큼 하단 패딩) */}
      <div
        className="max-w-md mx-auto px-4 py-6 space-y-4"
        style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
      >
        <Header />

        {activeTab === 'home' && (
          <HomeTab
            budget={budget}            monthTotal={monthTotal}
            editingBudget={editingBudget} budgetDraft={budgetDraft}
            onEditBudgetStart={() => { setEditingBudget(true); setBudgetDraft(String(budget)); }}
            onBudgetDraftChange={setBudgetDraft}
            onSaveBudget={saveBudget}
            onCancelBudgetEdit={() => setEditingBudget(false)}
            year={year} month={month}
            calDays={calDays} dayTotals={dayTotals}
            selDate={selDate} today={TODAY}
            onPrev={goPrev} onNext={goNext}
            onSelectDate={setSelDate}
            selExpenses={selExpenses}
            onOpenAddModal={openAddModal}
            onDeleteExpense={deleteExpense}
            onEditExpense={openEditModal}
          />
        )}

        {activeTab === 'search' && (
          <SearchTab
            expenses={expenses}
            paymentMethods={paymentMethods}
            onDeleteExpense={deleteExpense}
            onEditExpense={openEditModal}
          />
        )}

        {activeTab === 'payment' && (
          <PaymentTab
            expenses={expenses}
            paymentMethods={paymentMethods}
            onDeleteExpense={deleteExpense}
          />
        )}

        {activeTab === 'analysis' && (
          <AnalysisTab
            expenses={expenses}
            budget={budget}
            year={year}
            month={month}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            paymentMethods={paymentMethods}
            presets={presets}
            onUpdatePaymentMethods={setPaymentMethods}
            onUpdatePresets={setPresets}
            theme={theme}
            onThemeChange={setTheme}
          />
        )}
      </div>

      {/* FAB — 홈 탭에서만 표시 */}
      {activeTab === 'home' && (
        <FAB
          isOpen={fabOpen}
          onToggle={handleFabToggle}
          onGeneralAdd={handleGeneralAdd}
          onQuickAdd={handleQuickAdd}
        />
      )}

      {/* 하단 탭 내비게이션 */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* 지출 추가 모달 */}
      {showAddModal && (
        <AddExpenseModal
          form={form}
          paymentMethods={paymentMethods}
          onClose={() => setShowAddModal(false)}
          onFieldChange={(field, value) => setForm(f => ({ ...f, [field]: value }))}
          onSubmit={addExpense}
        />
      )}

      {/* 지출 편집 모달 */}
      {showEditModal && (
        <AddExpenseModal
          editMode
          form={editForm}
          paymentMethods={paymentMethods}
          onClose={() => { setShowEditModal(false); setEditingExpense(null); }}
          onFieldChange={(field, value) => setEditForm(f => ({ ...f, [field]: value }))}
          onSubmit={updateExpense}
        />
      )}

      {/* 빠른 추가 모달 (프리셋 선택) */}
      {showQuickModal && (
        <QuickAddModal
          presets={presets}
          selDate={selDate}
          onClose={() => setShowQuickModal(false)}
          onAddPreset={addPreset}
        />
      )}
    </div>
  );
}
