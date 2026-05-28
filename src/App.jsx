import { useState, useEffect, useMemo } from 'react';

import { DEFAULT_PAYMENT_METHODS, DEFAULT_PRESETS, DEFAULT_CATEGORIES } from './constants';
import { TODAY, uid, ls, addMonths }                from './utils';
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
  const [categories,     setCategories]     = useState(() => ls.get('et_categories',      DEFAULT_CATEGORIES));

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
    date:              TODAY,
    name:              '',
    amount:            '',
    paymentMethod:     paymentMethods[0] ?? '',
    installmentMonths: '1',
    memo:              '',
  });

  // ── 지출 편집 상태 ────────────────────────────────────────────
  const [showEditModal,   setShowEditModal]   = useState(false);
  const [editingExpense,  setEditingExpense]  = useState(null);
  const [editForm,        setEditForm]        = useState({
    date:          '',
    name:          '',
    amount:        '',
    paymentMethod: '',
    memo:          '',
  });

  // ── 로컬스토리지 자동 동기화 ──────────────────────────────────
  useEffect(() => ls.set('et_expenses',        expenses),       [expenses]);
  useEffect(() => ls.set('et_budget',          budget),         [budget]);
  useEffect(() => ls.set('et_payment_methods', paymentMethods), [paymentMethods]);
  useEffect(() => ls.set('et_presets',         presets),        [presets]);
  useEffect(() => ls.set('et_categories',      categories),     [categories]);

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
      name:              '',
      amount:            '',
      paymentMethod:     paymentMethods[0] ?? '',
      installmentMonths: '1',
      memo:              '',
    });
    setShowAddModal(true);
    setFabOpen(false);
  };

  // 새 지출 저장 (할부 지원)
  const addExpense = () => {
    const amount       = parseFloat(form.amount);
    const installments = Math.max(1, parseInt(form.installmentMonths, 10) || 1);
    if (!form.name.trim() || isNaN(amount) || amount <= 0) return;

    if (installments <= 1) {
      setExpenses(prev => [...prev, {
        id:            uid(),
        date:          form.date,
        name:          form.name.trim(),
        amount,
        paymentMethod: form.paymentMethod,
        memo:          form.memo.trim(),
      }]);
    } else {
      // 할부: 총액을 개월수로 균등 분할, 나머지는 첫 달에 합산
      // 이름에 "(X/Y개월)" 대신 메모에 할부 정보를 기록하고, installmentGroupId로 묶음
      const groupId   = uid();
      const perMonth  = Math.floor(amount / installments);
      const remainder = amount - perMonth * installments;
      const userMemo  = form.memo.trim();
      const entries   = Array.from({ length: installments }, (_, i) => ({
        id:                 uid(),
        date:               addMonths(form.date, i),
        name:               form.name.trim(),
        amount:             i === 0 ? perMonth + remainder : perMonth,
        paymentMethod:      form.paymentMethod,
        memo:               userMemo
          ? `${i + 1}/${installments}개월 할부 · ${userMemo}`
          : `${i + 1}/${installments}개월 할부`,
        installmentGroupId: groupId,
      }));
      setExpenses(prev => [...prev, ...entries]);
    }

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
      memo:          expense.memo ?? '',
    });
    setShowEditModal(true);
  };

  // 지출 수정 저장 — 할부 항목이면 동일 그룹 전체에 이름·결제수단·금액 전파
  const updateExpense = () => {
    const amount = parseFloat(editForm.amount);
    if (!editForm.name.trim() || isNaN(amount) || amount <= 0) return;

    const newName = editForm.name.trim();

    // ① 신규 방식: installmentGroupId로 그룹 전파
    if (editingExpense.installmentGroupId) {
      const groupId = editingExpense.installmentGroupId;
      setExpenses(prev => prev.map(e => {
        if (e.id === editingExpense.id) {
          return { ...e, date: editForm.date, name: newName, amount, paymentMethod: editForm.paymentMethod, memo: editForm.memo };
        }
        if (e.installmentGroupId === groupId) {
          return { ...e, name: newName, amount, paymentMethod: editForm.paymentMethod };
        }
        return e;
      }));

    // ② 구형 방식: 이름 패턴 "(X/Y개월)" 으로 그룹 전파 (기존 데이터 호환)
    } else {
      const legacyMatch = editingExpense.name.match(/^(.+) \((\d+)\/(\d+)개월\)$/);
      if (legacyMatch) {
        const [, origBase, , totalStr] = legacyMatch;
        const total = parseInt(totalStr, 10);
        const newNameMatch = newName.match(/^(.+) \(\d+\/\d+개월\)$/);
        const newBase = newNameMatch ? newNameMatch[1] : newName;

        setExpenses(prev => prev.map(e => {
          if (e.id === editingExpense.id) {
            return { ...e, date: editForm.date, name: newName, amount, paymentMethod: editForm.paymentMethod, memo: editForm.memo };
          }
          const sub = e.name.match(/^(.+) \((\d+)\/(\d+)개월\)$/);
          if (sub && sub[1] === origBase && parseInt(sub[3], 10) === total) {
            const k = parseInt(sub[2], 10);
            return { ...e, name: `${newBase} (${k}/${total}개월)`, paymentMethod: editForm.paymentMethod, amount };
          }
          return e;
        }));
      } else {
        setExpenses(prev => prev.map(e =>
          e.id === editingExpense.id
            ? { ...e, date: editForm.date, name: newName, amount, paymentMethod: editForm.paymentMethod, memo: editForm.memo }
            : e
        ));
      }
    }

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
      memo:          '',
    }]);
  };

  const deleteExpense = (id) =>
    setExpenses(prev => prev.filter(e => e.id !== id));

  // 카테고리 이름 변경 시 연관된 모든 지출 항목 이름도 일괄 업데이트 (반응형 리네임)
  const renameCategory = (oldName, newName) => {
    setCategories(prev => prev.map(c => c.name === oldName ? { ...c, name: newName } : c));
    setExpenses(prev => prev.map(e => e.name === oldName ? { ...e, name: newName } : e));
  };

  const handleRestore = ({ expenses, budget, paymentMethods, presets, categories, theme }) => {
    setExpenses(expenses);
    setBudget(budget);
    setPaymentMethods(paymentMethods);
    setPresets(presets);
    setCategories(categories);
    setTheme(theme);
  };

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
            expenses={expenses}
            budget={budget}
            paymentMethods={paymentMethods}
            presets={presets}
            onUpdatePaymentMethods={setPaymentMethods}
            onUpdatePresets={setPresets}
            categories={categories}
            onUpdateCategories={setCategories}
            onRenameCategory={renameCategory}
            theme={theme}
            onThemeChange={setTheme}
            onRestore={handleRestore}
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
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onFieldChange={(field, value) => setForm(f => ({ ...f, [field]: value }))}
          onSubmit={addExpense}
        />
      )}

      {/* 지출 편집 모달 */}
      {showEditModal && (
        <AddExpenseModal
          editMode
          editingExpense={editingExpense}
          form={editForm}
          paymentMethods={paymentMethods}
          categories={categories}
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
