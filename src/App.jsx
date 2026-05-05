import { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, X, Trash2, Check, Wallet,
} from 'lucide-react';

// ================================================================
// 상수 정의
// ================================================================

// 지원하는 결제 수단 목록
const PAYMENT_METHODS = [
  '현금', '신용카드', '체크카드', '롯데카드',
  '삼성페이', '카카오페이', '네이버페이',
];

// 빠른 추가 프리셋 (자주 사용하는 지출 항목)
const PRESETS = [
  { id: 'p1', emoji: '🚬', name: '담배 1갑',  amount: 4500, paymentMethod: '롯데카드'  },
  { id: 'p2', emoji: '☕', name: '커피',       amount: 5000, paymentMethod: '카카오페이' },
  { id: 'p3', emoji: '🏪', name: '편의점',     amount: 3000, paymentMethod: '현금'      },
];

// 월 이름 (한국어)
const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

// 요일 이름 (일요일 시작)
const DAYS = ['일','월','화','수','목','금','토'];

// ================================================================
// 유틸리티 함수
// ================================================================

// Date 객체 → YYYY-MM-DD 문자열
const toDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// 앱 로드 시 오늘 날짜 (고정)
const TODAY = toDateStr(new Date());

// 천단위 구분 포맷 (예: 4500 → "4,500")
const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n);

// 캘린더 셀 전용 컴팩트 포맷 (예: 15000 → "1.5만", 4500 → "4,500")
const compact = (n) => {
  if (n >= 10000) {
    const wan = n / 10000;
    return `${n % 10000 === 0 ? wan : wan.toFixed(1)}만`;
  }
  return fmt(n);
};

// 고유 ID 생성
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

// 로컬스토리지 헬퍼
const ls = {
  get: (key, fallback) => {
    try {
      const v = localStorage.getItem(key);
      return v !== null ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* 무시 */ }
  },
};

// ================================================================
// 메인 앱 컴포넌트
// ================================================================

export default function App() {
  const now = new Date();

  // 현재 캘린더 뷰 (연/월)
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed

  // 지출 데이터 (로컬스토리지에서 초기값 로드)
  const [expenses, setExpenses] = useState(() => ls.get('et_expenses', []));

  // 월 예산
  const [budget,       setBudget]       = useState(() => ls.get('et_budget', 500000));
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetDraft,  setBudgetDraft]   = useState('');

  // 선택된 날짜 → 일별 지출 패널 표시
  const [selDate, setSelDate] = useState(null);

  // 지출 추가 모달 상태
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    date:          TODAY,
    name:          '',
    amount:        '',
    paymentMethod: PAYMENT_METHODS[0],
  });

  // 데이터 변경 시 로컬스토리지 자동 동기화
  useEffect(() => ls.set('et_expenses', expenses), [expenses]);
  useEffect(() => ls.set('et_budget',   budget),   [budget]);

  // ──────────────────────────────────────────────────────────────
  // 계산값 (메모이제이션)
  // ──────────────────────────────────────────────────────────────

  // 현재 뷰 월의 지출 목록
  const monthExpenses = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return expenses.filter(e => e.date.startsWith(prefix));
  }, [expenses, year, month]);

  // 날짜별 지출 합계 맵 { 'YYYY-MM-DD': 총액 }
  const dayTotals = useMemo(() => {
    const map = {};
    monthExpenses.forEach(e => {
      map[e.date] = (map[e.date] || 0) + e.amount;
    });
    return map;
  }, [monthExpenses]);

  // 월 총 지출
  const monthTotal = useMemo(() =>
    monthExpenses.reduce((sum, e) => sum + e.amount, 0),
    [monthExpenses]
  );

  // 예산 사용률 (%) — 최대 100%
  const budgetPct = budget > 0 ? Math.min((monthTotal / budget) * 100, 100) : 0;

  // 예산 진행 바 색상 (녹색 → 주황 → 빨강)
  const barColor =
    budgetPct < 60 ? 'bg-emerald-500' :
    budgetPct < 85 ? 'bg-amber-400'   :
    'bg-red-500';

  // 캘린더 날짜 배열 (앞쪽 빈 칸 null + 날짜 숫자)
  const calDays = useMemo(() => {
    const startDow    = new Date(year, month, 1).getDay();       // 첫 날의 요일 (0=일)
    const daysInMonth = new Date(year, month + 1, 0).getDate();  // 이번 달 총 일수
    return [
      ...Array(startDow).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
  }, [year, month]);

  // 선택된 날짜의 지출 목록
  const selExpenses = useMemo(() =>
    selDate ? expenses.filter(e => e.date === selDate) : [],
    [expenses, selDate]
  );

  // ──────────────────────────────────────────────────────────────
  // 이벤트 핸들러
  // ──────────────────────────────────────────────────────────────

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

  const openModal = (date = TODAY) => {
    setForm({ date, name: '', amount: '', paymentMethod: PAYMENT_METHODS[0] });
    setShowModal(true);
  };

  // 새 지출 추가
  const addExpense = () => {
    const amount = parseFloat(form.amount);
    if (!form.name.trim() || isNaN(amount) || amount <= 0) return;
    setExpenses(prev => [...prev, {
      id: uid(),
      date: form.date,
      name: form.name.trim(),
      amount,
      paymentMethod: form.paymentMethod,
    }]);
    setShowModal(false);
  };

  // 프리셋 즉시 추가 (선택된 날짜 우선, 없으면 오늘)
  const addPreset = (preset) => {
    setExpenses(prev => [...prev, {
      id: uid(),
      date:          selDate || TODAY,
      name:          preset.name,
      amount:        preset.amount,
      paymentMethod: preset.paymentMethod,
    }]);
  };

  const deleteExpense = (id) => setExpenses(prev => prev.filter(e => e.id !== id));

  // 예산 저장 (숫자만 추출하여 파싱)
  const saveBudget = () => {
    const val = parseFloat(budgetDraft.replace(/[^0-9.]/g, ''));
    if (!isNaN(val) && val >= 0) setBudget(val);
    setEditingBudget(false);
    setBudgetDraft('');
  };

  // ──────────────────────────────────────────────────────────────
  // 렌더
  // ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-950 text-white" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="max-w-md mx-auto px-4 py-6 pb-28 space-y-4" style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom))' }}>

        {/* ── 헤더 ── */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-violet-400" />
            <h1 className="text-lg font-bold tracking-tight">지출 트래커</h1>
          </div>
          <time className="text-xs text-gray-500">{TODAY}</time>
        </header>

        {/* ── 예산 카드 ── */}
        <section className="bg-gray-900 rounded-2xl p-4 space-y-3">
          {/* 예산 금액 (클릭하면 수정 모드) */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">월 예산</span>
            {editingBudget ? (
              <div className="flex items-center gap-1.5">
                <input
                  autoFocus
                  type="text"
                  inputMode="numeric"
                  value={budgetDraft}
                  onChange={e => setBudgetDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter')  saveBudget();
                    if (e.key === 'Escape') setEditingBudget(false);
                  }}
                  className="w-28 bg-gray-800 text-right text-sm px-2 py-1 rounded-lg border border-gray-700 focus:border-violet-500 outline-none text-white"
                />
                <button onClick={saveBudget} className="text-violet-400 hover:text-violet-300">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditingBudget(false)} className="text-gray-600 hover:text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setEditingBudget(true); setBudgetDraft(String(budget)); }}
                className="text-sm font-bold text-violet-400 hover:text-violet-300 transition-colors"
              >
                ₩{fmt(budget)}
              </button>
            )}
          </div>

          {/* 이번 달 총 지출 */}
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black">₩{fmt(monthTotal)}</span>
            <span className="text-xs text-gray-500">{budgetPct.toFixed(1)}% 사용</span>
          </div>

          {/* 예산 진행 바 */}
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>

          {/* 예산 초과 경고 메시지 */}
          {monthTotal > budget && budget > 0 && (
            <p className="text-xs font-semibold text-red-400">
              ⚠ 예산 초과 — ₩{fmt(monthTotal - budget)} 더 사용했습니다
            </p>
          )}
        </section>

        {/* ── 빠른 추가 프리셋 ── */}
        <section className="space-y-2">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            빠른 추가 → {selDate ?? '오늘'}
          </p>
          <div className="flex gap-2 flex-wrap">
            {PRESETS.map(p => (
              <button
                key={p.id}
                onClick={() => addPreset(p)}
                className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 active:scale-95 border border-gray-800 hover:border-violet-700 rounded-xl px-3 py-2 text-xs transition-all"
              >
                <span>{p.emoji}</span>
                <span className="text-gray-300">{p.name}</span>
                <span className="text-violet-400 font-bold">₩{fmt(p.amount)}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── 캘린더 ── */}
        <section className="bg-gray-900 rounded-2xl overflow-hidden">
          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={goPrev}
              className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold">{year}년 {MONTHS[month]}</span>
            <button
              onClick={goNext}
              className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 border-t border-gray-800">
            {DAYS.map((d, i) => (
              <div
                key={d}
                className={`text-center py-2 text-[10px] font-bold ${
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-sky-400' : 'text-gray-600'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* 날짜 셀 그리드 */}
          <div className="grid grid-cols-7 border-t border-gray-800">
            {calDays.map((day, i) => {
              // 이전 달 빈 칸
              if (!day) {
                return (
                  <div
                    key={`empty-${i}`}
                    className="min-h-[54px] border-b border-r border-gray-800/40"
                  />
                );
              }

              const ds    = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const total = dayTotals[ds] || 0;
              const isToday = ds === TODAY;
              const isSel   = ds === selDate;
              const dow     = new Date(year, month, day).getDay(); // 실제 요일 (0=일)

              return (
                <button
                  key={ds}
                  onClick={() => setSelDate(isSel ? null : ds)}
                  className={`
                    relative flex flex-col items-center justify-start
                    min-h-[54px] pt-2 pb-1.5
                    border-b border-r border-gray-800/40
                    transition-colors select-none
                    ${isSel ? 'bg-violet-950/60' : 'hover:bg-gray-800/50'}
                  `}
                >
                  {/* 오늘 날짜 강조 원 */}
                  {isToday && (
                    <span className="absolute top-1.5 left-0 right-0 mx-auto w-6 h-6 rounded-full bg-violet-600/20 border border-violet-500/60" />
                  )}

                  {/* 날짜 숫자 */}
                  <span className={`
                    relative z-10 text-xs font-semibold
                    w-6 h-6 flex items-center justify-center rounded-full
                    ${isToday ? 'text-violet-300' :
                      dow === 0 ? 'text-red-400'  :
                      dow === 6 ? 'text-sky-400'  : 'text-gray-300'}
                  `}>
                    {day}
                  </span>

                  {/* 지출 있음: 금액 표시 / 지출 없음: 초록 점 (제로 뱃지) */}
                  {total > 0 ? (
                    <span className="text-[9px] text-rose-400 font-bold leading-tight mt-0.5">
                      {compact(total)}
                    </span>
                  ) : (
                    <span className="w-1 h-1 rounded-full bg-emerald-500/70 mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* 캘린더 범례 */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-800">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 inline-block" />
              지출 없음
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
              <span className="text-rose-400 font-bold text-[9px]">1,000</span>
              지출 있음
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
              <span className="w-3 h-3 rounded-full border border-violet-500/60 inline-block" />
              오늘
            </div>
          </div>
        </section>

        {/* ── 선택된 날짜의 지출 패널 ── */}
        {selDate && (
          <section className="bg-gray-900 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-200">{selDate} 지출 내역</h2>
              <button
                onClick={() => openModal(selDate)}
                className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 bg-violet-900/30 hover:bg-violet-900/50 px-2.5 py-1.5 rounded-lg transition-all"
              >
                <Plus className="w-3 h-3" />
                지출 추가
              </button>
            </div>

            {selExpenses.length === 0 ? (
              // 지출 없는 날 표시
              <div className="text-center py-8">
                <div className="text-3xl mb-2">✨</div>
                <p className="text-sm text-gray-600">이 날은 지출이 없어요</p>
              </div>
            ) : (
              <>
                <ul className="space-y-2">
                  {selExpenses.map(e => (
                    <li
                      key={e.id}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-xl"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-100 font-semibold truncate">{e.name}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{e.paymentMethod}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        <span className="text-sm font-bold text-rose-400">₩{fmt(e.amount)}</span>
                        <button
                          onClick={() => deleteExpense(e.id)}
                          className="text-gray-700 hover:text-red-400 transition-colors"
                          aria-label="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* 일별 합계 */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                  <span className="text-xs text-gray-500">합계</span>
                  <span className="text-base font-black text-rose-300">
                    ₩{fmt(selExpenses.reduce((s, e) => s + e.amount, 0))}
                  </span>
                </div>
              </>
            )}
          </section>
        )}
      </div>

      {/* ── FAB: 지출 추가 플로팅 버튼 (safe area 대응) ── */}
      <div className="fixed right-4 z-40" style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
        <button
          onClick={() => openModal(selDate || TODAY)}
          className="w-14 h-14 bg-violet-600 hover:bg-violet-500 active:scale-90 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-950/60 transition-all"
          aria-label="지출 추가"
        >
          <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
        </button>
      </div>

      {/* ── 지출 추가 모달 (바텀 시트 스타일) ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md bg-gray-900 rounded-t-3xl px-5 pt-4 pb-10 shadow-2xl animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {/* 드래그 핸들 시각적 표시 */}
            <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-5" />

            {/* 모달 헤더 */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold">지출 추가</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 입력 폼 */}
            <div className="space-y-3">
              {/* 날짜 */}
              <label className="block">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">날짜</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors"
                />
              </label>

              {/* 상품명 */}
              <label className="block">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">상품명</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="무엇을 구매했나요?"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && addExpense()}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder-gray-600"
                />
              </label>

              {/* 금액 */}
              <label className="block">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">금액 (원)</span>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0"
                  min="0"
                  inputMode="numeric"
                  onKeyDown={e => e.key === 'Enter' && addExpense()}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder-gray-600"
                />
              </label>

              {/* 결제 수단 */}
              <label className="block">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">결제 수단</span>
                <select
                  value={form.paymentMethod}
                  onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors appearance-none cursor-pointer"
                >
                  {PAYMENT_METHODS.map(pm => (
                    <option key={pm} value={pm}>{pm}</option>
                  ))}
                </select>
              </label>
            </div>

            {/* 추가 버튼 */}
            <button
              onClick={addExpense}
              disabled={!form.name.trim() || !form.amount || parseFloat(form.amount) <= 0}
              className="mt-5 w-full py-3.5 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
            >
              추가하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
