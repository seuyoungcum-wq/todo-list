/**
 * Date 객체를 YYMMDD 6자리 문자열로 변환 (예: 2026-11-26 -> '261126')
 */
export function toYYMMDD(date: Date = new Date()): string {
  const yy = String(date.getFullYear() % 100).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

/**
 * 오늘 날짜의 YYMMDD 문자열
 */
export function getTodayYYMMDD(): string {
  return toYYMMDD(new Date());
}

/**
 * 내일 날짜의 YYMMDD 문자열
 */
export function getTomorrowYYMMDD(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toYYMMDD(d);
}

/**
 * YYMMDD 문자열이 유효한 날짜인지 검증
 */
export function isValidYYMMDD(str: string): boolean {
  if (!/^\d{6}$/.test(str)) return false;
  const yy = parseInt(str.substring(0, 2), 10);
  const mm = parseInt(str.substring(2, 4), 10);
  const dd = parseInt(str.substring(4, 6), 10);

  if (mm < 1 || mm > 12) return false;
  if (dd < 1 || dd > 31) return false;

  const fullYear = 2000 + yy;
  const date = new Date(fullYear, mm - 1, dd);
  return (
    date.getFullYear() === fullYear &&
    date.getMonth() === mm - 1 &&
    date.getDate() === dd
  );
}

/**
 * YYMMDD 문자열을 읽기 쉬운 형태(예: "26.11.26" 또는 "오늘", "내일")로 포맷팅
 */
export function formatYYMMDD(str: string): string {
  if (!isValidYYMMDD(str)) return str;

  const today = getTodayYYMMDD();
  const tomorrow = getTomorrowYYMMDD();

  const formatted = `${str.substring(0, 2)}.${str.substring(2, 4)}.${str.substring(4, 6)}`;

  if (str === today) {
    return `${formatted} (오늘)`;
  }
  if (str === tomorrow) {
    return `${formatted} (내일)`;
  }
  return formatted;
}

/**
 * ISO 날짜 문자열을 한국어 형식으로 포맷팅합니다.
 */
export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    }).format(date);
  } catch {
    return '';
  }
}

/**
 * 오늘 날짜를 한국어 친화적으로 포맷팅합니다 (예: 2026년 11월 26일 목요일).
 */
export function formatToday(): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date());
}

/**
 * 등록/수정 시간 표시 (예: 오전 10:24)
 */
export function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return '';
  }
}
