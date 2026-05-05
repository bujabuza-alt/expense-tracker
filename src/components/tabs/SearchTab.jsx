import { useState, useMemo } from 'react';
import { Search, X, Trash2 } from 'lucide-react';
import { fmt } from '../../utils';

export default function SearchTab({ expenses, paymentMethods, onDeleteExpense }) {
  const [query,    setQuery]    = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [filterPM, setFilterPM] = useState('전체');

  // 필터 조건에 맞는 지출 목록 (날짜 역순)
  const results = useMemo(() => {
    const q   = query.trim().toLowerCase();
    const pms = filterPM === '전체' ? null : filterPM;

    return expenses
      .filter(e => {
        if (q && !e.name.toLowerCase().includes(q)) return false;
        if (dateFrom && e.date < dateFrom)           return false;
        if (dateTo   && e.date > dateTo)             return false;
        if (pms      && e.paymentMethod !== pms)     return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, query, dateFrom, dateTo, filterPM]);

  const total      = useMemo(() => results.reduce((s, e) => s + e.amount, 0), [results]);
  const hasFilters = Boolean(query || dateFrom || dateTo || filterPM !== '전체');

  const clearFilters = () => {
    setQuery('');
    setDateFrom('');
    setDateTo('');
    setFilterPM('전체');
  };

  return (
    <div className="space-y-4">
      {/* 검색 필터 패널 */}
      <section className="bg-gray-900 rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-bold text-gray-200 flex items-center gap-2">
          <Search className="w-4 h-4 text-violet-400" />
          지출 검색
        </h2>

        {/* 카테고리 검색어 */}
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
            카테고리
          </label>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="검색어를 입력하세요"
            style={{ boxSizing: 'border-box' }}
            className="block w-full bg-gray-800 border border-gray-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder-gray-600"
          />
        </div>

        {/* 기간(날짜 범위) 선택 */}
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
            기간
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              style={{ colorScheme: 'dark', boxSizing: 'border-box' }}
              className="block w-full bg-gray-800 border border-gray-700 focus:border-violet-500 rounded-xl px-2.5 py-2.5 text-xs text-white outline-none transition-colors"
            />
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              style={{ colorScheme: 'dark', boxSizing: 'border-box' }}
              className="block w-full bg-gray-800 border border-gray-700 focus:border-violet-500 rounded-xl px-2.5 py-2.5 text-xs text-white outline-none transition-colors"
            />
          </div>
          {dateFrom && dateTo && (
            <p className="text-[10px] text-gray-600 mt-1 pl-0.5">
              {dateFrom} ~ {dateTo}
            </p>
          )}
        </div>

        {/* 결제 수단 필터 */}
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
            결제 수단
          </label>
          <select
            value={filterPM}
            onChange={e => setFilterPM(e.target.value)}
            style={{ boxSizing: 'border-box' }}
            className="block w-full bg-gray-800 border border-gray-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors appearance-none cursor-pointer"
          >
            <option value="전체">전체</option>
            {paymentMethods.map(pm => (
              <option key={pm} value={pm}>{pm}</option>
            ))}
          </select>
        </div>

        {/* 필터 초기화 버튼 */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X className="w-3 h-3" />
            필터 초기화
          </button>
        )}
      </section>

      {/* 검색 결과 */}
      <section className="bg-gray-900 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-400">
            검색 결과 {results.length}건
          </span>
          {results.length > 0 && (
            <span className="text-xs font-bold text-rose-400">
              합계 ₩{fmt(total)}
            </span>
          )}
        </div>

        {results.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-sm text-gray-600">
              {hasFilters ? '검색 결과가 없습니다' : '검색어 또는 필터를 입력하세요'}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {results.map(e => (
              <li
                key={e.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-xl"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-100 font-semibold truncate">{e.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {e.date} · {e.paymentMethod}
                  </p>
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
        )}
      </section>
    </div>
  );
}
