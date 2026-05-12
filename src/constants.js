// ================================================================
// 앱 전역 상수 정의
// ================================================================

// 기본 결제 수단 목록 (사용자가 편집 가능)
export const DEFAULT_PAYMENT_METHODS = [
  '현금', '신용카드', '체크카드', '롯데카드',
  '삼성페이', '카카오페이', '네이버페이',
];

// 기본 카테고리 목록 (사용자가 편집·정렬·삭제 가능)
export const DEFAULT_CATEGORIES = [
  { id: 'cat1', name: '식비' },
  { id: 'cat2', name: '교통비' },
  { id: 'cat3', name: '카페/음료' },
  { id: 'cat4', name: '쇼핑' },
  { id: 'cat5', name: '생활용품' },
  { id: 'cat6', name: '의료/건강' },
  { id: 'cat7', name: '문화/여가' },
  { id: 'cat8', name: '기타' },
];

// 빠른 추가 기본 프리셋 (사용자가 편집 가능)
export const DEFAULT_PRESETS = [
  { id: 'p1', emoji: '🚬', name: '담배 1갑', amount: 4500, paymentMethod: '롯데카드' },
  { id: 'p2', emoji: '☕', name: '커피',      amount: 5000, paymentMethod: '카카오페이' },
  { id: 'p3', emoji: '🏪', name: '편의점',    amount: 3000, paymentMethod: '현금' },
];

// 월 이름 (한국어)
export const MONTHS = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

// 요일 이름 (일요일 시작)
export const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
