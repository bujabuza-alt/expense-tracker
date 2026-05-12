import { useMemo, useState } from 'react';
import { CreditCard, Trash2, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from 'lucide-react';
import { fmt } from '../../utils';

const fmtMonth = (key) => {
  const [y, m] = key.split('-');
  return `${y}년 ${parseInt(m)}월`;
};

export default function PaymentTab({ expenses, paymentMethods, onDeleteExpense }) {
  const [sortOrder, setSortOrder] = useState('desc'); // desc = 느린순(최신), asc = 빠른순(오래된)
  const [collapsed, setCollapsed] = useState(new Set());

  const toggleGroup = (method) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(method)) next.delete(method);
      else next.add(method);
      return next;
    });
  };

  const groups = useMemo(() => {
    const map = {};
    paymentMethods.forEach(pm => { map[pm] = []; });
    expenses.forEach(e => {
      if (!map[e.paymentMethod]) map[e.paymentMethod] = [];
      map[e.paymentMethod].push(e);
    });

    return Object.entries(map)
      .filter(([, items]) => items.length > 0)
      .map(([method, items]) => {
        const sorted = [...items].sort((a, b) =>
          sortOrder === 'desc'
            ? b.date.localeCompare(a.date)
            : a.date.localeCompare(b.date)
        );
        // 월별 그룹핑
        const monthMap = {};
        sorted.forEach(e => {
          const key = e.date.slice(0, 7);
          if (!monthMap[key]) monthMap[key] = [];
          monthMap[key].push(e);
        });
        const monthGroups = Object.entries(monthMap).sort((a, b) =>
          sortOrder === 'desc' ? b[0].localeCompare(a[0]) : a[0].localeCompare(b[0])
        );
        return {
          method,
          monthGroups,
          total: items.reduce((s, e) => s + e.amount, 0),
          count: items.length,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [expenses, paymentMethods, sortOrder]);

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
        <div className="flex items-center gap-3">
          {/* 날짜 정렬 토글 */}
          <button
            onClick={() => setSortOrder(o => o === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-violet-400 bg-gray-800 px-2.5 py-1 rounded-lg transition-colors"
          >
            {sortOrder === 'desc'
              ? <><ArrowDown className="w-3 h-3" />느린순</>
              : <><ArrowUp   className="w-3 h-3" />빠른순</>}
          </button>
          <div className="text-right">
            <p className="text-base font-black text-rose-300">₩{fmt(grandTotal)}</p>
            <p className="text-[10px] text-gray-600">{groups.length}개 수단</p>
          </div>
        </div>
      </section>

      {/* 결제 수단별 그룹 */}
      {groups.map(({ method, monthGroups, total, count }) => {
        const isCollapsed = collapsed.has(method);
        return (
          <section key={method} className="bg-gray-900 rounded-2xl overflow-hidden">
            {/* 그룹 헤더 — 클릭으로 접기/펼치기 */}
            <button
              onClick={() => toggleGroup(method)}
              className="w-full px-4 py-3 border-b border-gray-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-200">{method}</span>
                <span className="text-[10px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded-full">
                  {count}건
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-violet-400">₩{fmt(total)}</span>
                {isCollapsed
                  ? <ChevronDown className="w-4 h-4 text-gray-500" />
                  : <ChevronUp   className="w-4 h-4 text-gray-500" />}
              </div>
            </button>

            {/* 월별 그룹 목록 */}
            {!isCollapsed && (
              <div>
                {monthGroups.map(([monthKey, items]) => (
                  <div key={monthKey}>
                    {/* 월 구분 헤더 */}
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50">
                      <span className="text-[11px] font-bold text-violet-400">
                        {fmtMonth(monthKey)}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-500">
                        ₩{fmt(items.reduce((s, e) => s + e.amount, 0))}
                      </span>
                    </div>
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
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
