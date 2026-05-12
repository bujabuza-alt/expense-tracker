import { useMemo } from 'react';
import { CreditCard, Trash2 } from 'lucide-react';
import { fmt } from '../../utils';

export default function PaymentTab({ expenses, paymentMethods, onDeleteExpense }) {
  // 결제 수단별 지출 그룹화 — 총액 내림차순 정렬
  const groups = useMemo(() => {
    const map = {};
    // 사용자 정의 결제 수단 순서를 기반으로 초기화
    paymentMethods.forEach(pm => { map[pm] = []; });
    // 지출을 해당 결제 수단 그룹에 분류
    expenses.forEach(e => {
      if (!map[e.paymentMethod]) map[e.paymentMethod] = [];
      map[e.paymentMethod].push(e);
    });

    return Object.entries(map)
      .filter(([, items]) => items.length > 0)
      .map(([method, items]) => ({
        method,
        items: [...items].sort((a, b) => b.date.localeCompare(a.date)),
        total: items.reduce((s, e) => s + e.amount, 0),
      }))
      .sort((a, b) => b.total - a.total);
  }, [expenses, paymentMethods]);

  const grandTotal = useMemo(
    () => groups.reduce((s, g) => s + g.total, 0),
    [groups]
  );

  if (groups.length === 0) {
    return (
      <section className="bg-gray-900 rounded-2xl p-4">
        <div className="text-center py-16">
          <div className="text-4xl mb-3">💳</div>
          <p className="text-sm text-gray-600">아직 지출 내역이 없습니다</p>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {/* 전체 합계 카드 */}
      <section className="bg-gray-900 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-bold text-gray-300">결제 수단별 지출</span>
        </div>
        <div className="text-right">
          <p className="text-base font-black text-rose-300">₩{fmt(grandTotal)}</p>
          <p className="text-[10px] text-gray-600">{groups.length}개 수단</p>
        </div>
      </section>

      {/* 결제 수단별 그룹 */}
      {groups.map(({ method, items, total }) => (
        <section key={method} className="bg-gray-900 rounded-2xl overflow-hidden">
          {/* 그룹 헤더 */}
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-200">{method}</span>
              <span className="text-[10px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded-full">
                {items.length}건
              </span>
            </div>
            <span className="text-sm font-black text-violet-400">₩{fmt(total)}</span>
          </div>

          {/* 지출 목록 */}
          <ul className="divide-y divide-gray-800/60">
            {items.map(e => (
              <li key={e.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-100 font-medium truncate">{e.name}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">{e.date}</p>
                  {e.memo && (
                    <p className="text-[10px] text-gray-600 mt-0.5 truncate">{e.memo}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <span className="text-sm font-bold text-rose-400">₩{fmt(e.amount)}</span>
                  <button
                    onClick={() => onDeleteExpense(e.id)}
                    className="text-gray-700 hover:text-red-400 transition-colors"
                    aria-label="삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
