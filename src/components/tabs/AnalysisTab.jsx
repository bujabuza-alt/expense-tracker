import { useMemo } from 'react';
import { BarChart2 } from 'lucide-react';
import { fmt }       from '../../utils';
import { MONTHS }    from '../../constants';

// 카테고리별 색상 팔레트
const PALETTE = [
  'bg-violet-500', 'bg-blue-500',   'bg-emerald-500', 'bg-amber-400',
  'bg-rose-500',   'bg-sky-500',    'bg-orange-500',  'bg-pink-500',
  'bg-teal-500',   'bg-indigo-500', 'bg-lime-500',    'bg-cyan-500',
];

export default function AnalysisTab({ expenses, budget, year, month }) {
  // 현재 표시 중인 달의 지출만 필터링
  const monthExpenses = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return expenses.filter(e => e.date.startsWith(prefix));
  }, [expenses, year, month]);

  const monthTotal = useMemo(
    () => monthExpenses.reduce((s, e) => s + e.amount, 0),
    [monthExpenses]
  );

  // 카테고리(이름)별 집계 — 총액 내림차순 정렬
  const categories = useMemo(() => {
    const map = {};
    monthExpenses.forEach(e => {
      map[e.name] = (map[e.name] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        pct:       monthTotal > 0 ? (amount / monthTotal) * 100 : 0,
        budgetPct: budget > 0     ? (amount / budget)     * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthExpenses, monthTotal, budget]);

  const budgetPct = budget > 0 ? Math.min((monthTotal / budget) * 100, 100) : 0;
  const barColor  =
    budgetPct < 60 ? 'bg-emerald-500' :
    budgetPct < 85 ? 'bg-amber-400'   : 'bg-red-500';

  return (
    <div className="space-y-4">
      {/* 월 예산 개요 카드 */}
      <section className="bg-gray-900 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-bold">{year}년 {MONTHS[month]} 분석</span>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-black">₩{fmt(monthTotal)}</span>
          {budget > 0 && (
            <span className="text-xs text-gray-500">예산 ₩{fmt(budget)}</span>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>{budgetPct.toFixed(1)}% 사용</span>
            {budget > 0 && (
              <span>
                {monthTotal <= budget
                  ? `₩${fmt(budget - monthTotal)} 남음`
                  : `₩${fmt(monthTotal - budget)} 초과`}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 카테고리별 지출 비중 */}
      <section className="bg-gray-900 rounded-2xl p-4 space-y-4">
        <h3 className="text-sm font-bold text-gray-300">카테고리별 지출 비중</h3>

        {categories.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm text-gray-600">이번 달 지출 내역이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map(({ name, amount, pct, budgetPct: bpct }, idx) => {
              const color = PALETTE[idx % PALETTE.length];
              return (
                <div key={name} className="space-y-1.5">
                  {/* 카테고리명 + 금액 */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
                      <span className="text-sm text-gray-200 font-medium truncate">{name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-500">{pct.toFixed(1)}%</span>
                      <span className="text-sm font-bold text-rose-400">₩{fmt(amount)}</span>
                    </div>
                  </div>

                  {/* 지출 비중 진행 바 */}
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* 예산 대비 비중 */}
                  {budget > 0 && (
                    <p className="text-[10px] text-gray-600 pl-4">
                      전체 예산의 {bpct.toFixed(1)}% 차지
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
