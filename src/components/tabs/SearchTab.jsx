import { useState, useMemo } from 'react';
import { Search, X, Trash2, Pencil } from 'lucide-react';
import { fmt } from '../../utils';
import { useTheme } from '../../context/ThemeContext';

// 업데이트 이력:
// - 기간 필터에 월별 프리셋 버튼 추가 (이번 달, 지난 달, 2달 전, 3달 전)
// - 검색 결과 항목에 편집(연필) 버튼 추가
// - onEditExpense 프롭 추가
// - 레이아웃 수정: 프리셋 버튼을 grid-cols-4 로 교체하여 버튼·날짜입력 겹침 해결
// - 날짜 입력 grid 셀에 min-w-0 래퍼 추가로 overflow 차단

// YYYY-MM-DD 문자열 반환 헬퍼
const toIso = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// monthsAgo 개월 전의 첫날/마지막날 범위를 반환
const monthRange = (monthsAgo) => {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end   = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  return { from: toIso(start), to: toIso(end) };
};

const MONTH_PRESETS = [
  { label: '이번 달', ago: 0 },
  { label: '지난 달', ago: 1 },
  { label: '2달 전',  ago: 2 },
  { label: '3달 전',  ago: 3 },
];

export default function SearchTab({ expenses, paymentMethods, onDeleteExpense, onEditExpense }) {
  const { theme } = useTheme();
  const [query,    setQuery]    = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [filterPM, setFilterPM] = useState('전체');
  const [activePreset, setActivePreset] = useState(null);

  // 월별 프리셋 적용
  const applyMonthPreset = (ago) => {
    const { from, to } = monthRange(ago);
    setDateFrom(from);
    setDateTo(to);
    setActivePreset(ago);
  };

  // 수동 날짜 변경 시 프리셋 선택 해제
  const handleDateFromChange = (val) => {
    setDateFrom(val);
    setActivePreset(null);
  };
  const handleDateToChange = (val) => {
    setDateTo(val);
    setActivePreset(null);
  };

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
    setActivePreset(null);
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
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
            기간
          </label>

          {/* 월별 프리셋 버튼 — grid-cols-4 로 고정하여 줄바꿈 없이 정렬 */}
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {MONTH_PRESETS.map(({ label, ago }) => (
              <button
                key={ago}
                onClick={() => applyMonthPreset(ago)}
                className={`
                  text-[11px] font-semibold px-1 py-1.5 rounded-lg border transition-all text-center
                  ${activePreset === ago
                    ? 'bg-violet-600 border-violet-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-violet-600 hover:text-violet-300'}
                `}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 날짜 범위 입력 — 세로 스택, 다른 입력칸과 동일한 높이 */}
          <div className="flex flex-col gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={e => handleDateFromChange(e.target.value)}
              style={{ colorScheme: theme === 'japan' ? 'light' : 'dark', boxSizing: 'border-box' }}
              className="block w-full h-[42px] bg-gray-800 border border-gray-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors"
            />
            <input
              type="date"
              value={dateTo}
              onChange={e => handleDateToChange(e.target.value)}
              style={{ colorScheme: theme === 'japan' ? 'light' : 'dark', boxSizing: 'border-box' }}
              className="block w-full h-[42px] bg-gray-800 border border-gray-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors"
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
                  {onEditExpense && (
                    <button
                      onClick={() => onEditExpense(e)}
                      className="text-gray-600 hover:text-violet-400 transition-colors"
                      aria-label="편집"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
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
