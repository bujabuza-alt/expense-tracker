// ================================================================
// 유틸리티 함수
// ================================================================

// Date 객체 → YYYY-MM-DD 문자열
const _toDateStr = (d) => {
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const toDateStr = _toDateStr;

// 앱 로드 시 오늘 날짜 (고정 — 리렌더 시 변경되지 않음)
export const TODAY = _toDateStr(new Date());

// 천단위 구분 포맷 (예: 4500 → "4,500")
export const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n);

// 캘린더 셀 전용 컴팩트 포맷 (예: 15000 → "1.5만")
export const compact = (n) => {
  if (n >= 10000) {
    const wan = n / 10000;
    return `${n % 10000 === 0 ? wan : wan.toFixed(1)}만`;
  }
  return fmt(n);
};

// 고유 ID 생성
export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

// 로컬스토리지 헬퍼
export const ls = {
  get: (key, fallback) => {
    try {
      const v = localStorage.getItem(key);
      return v !== null ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch { /* 무시 */ }
  },
};
