import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTHS, DAYS } from '../constants';
import { compact } from '../utils';

export default function CalendarView({
  year, month, calDays, dayTotals, selDate, today,
  onPrev, onNext, onSelectDate,
}) {
  return (
    <section className="bg-gray-900 rounded-2xl overflow-hidden">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onPrev}
          className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold">{year}년 {MONTHS[month]}</span>
        <button
          onClick={onNext}
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
          if (!day) {
            return (
              <div
                key={`e-${i}`}
                className="min-h-[54px] border-b border-r border-gray-800/40"
              />
            );
          }

          const ds      = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const total   = dayTotals[ds] || 0;
          const isToday = ds === today;
          const isSel   = ds === selDate;
          const dow     = new Date(year, month, day).getDay();

          return (
            <button
              key={ds}
              onClick={() => onSelectDate(isSel ? null : ds)}
              className={`
                relative flex flex-col items-center justify-start
                min-h-[54px] pt-2 pb-1.5
                border-b border-r border-gray-800/40
                transition-colors select-none
                ${isSel ? 'bg-violet-950/60' : 'hover:bg-gray-800/50'}
              `}
            >
              {isToday && (
                <span className="absolute top-1.5 left-0 right-0 mx-auto w-6 h-6 rounded-full bg-violet-600/20 border border-violet-500/60" />
              )}
              <span className={`
                relative z-10 text-xs font-semibold
                w-6 h-6 flex items-center justify-center rounded-full
                ${isToday  ? 'text-violet-300' :
                  dow === 0 ? 'text-red-400'   :
                  dow === 6 ? 'text-sky-400'   : 'text-gray-300'}
              `}>
                {day}
              </span>
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
  );
}
