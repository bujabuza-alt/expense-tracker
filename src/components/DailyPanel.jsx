import { Plus, Trash2, Pencil } from 'lucide-react';
import { fmt } from '../utils';

// 업데이트 이력:
// - onEditExpense 프롭 추가 및 각 지출 항목에 편집(연필) 버튼 추가
export default function DailyPanel({ selDate, selExpenses, onAddExpense, onDeleteExpense, onEditExpense }) {
  const total = selExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <section className="bg-gray-900 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-200">{selDate} 지출 내역</h2>
        <button
          onClick={() => onAddExpense(selDate)}
          className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 bg-violet-900/30 hover:bg-violet-900/50 px-2.5 py-1.5 rounded-lg transition-all"
        >
          <Plus className="w-3 h-3" />
          지출 추가
        </button>
      </div>

      {selExpenses.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">✨</div>
          <p className="text-sm text-gray-600">이 날은 지출이 없어요</p>
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {selExpenses.map(e => (
              <li key={e.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-100 font-semibold truncate">{e.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{e.paymentMethod}</p>
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

          <div className="flex justify-between items-center pt-2 border-t border-gray-800">
            <span className="text-xs text-gray-500">합계</span>
            <span className="text-base font-black text-rose-300">₩{fmt(total)}</span>
          </div>
        </>
      )}
    </section>
  );
}
