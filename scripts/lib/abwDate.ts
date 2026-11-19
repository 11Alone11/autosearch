const MONTHS: Record<string, number> = {
  января: 0,
  февраля: 1,
  марта: 2,
  апреля: 3,
  мая: 4,
  июня: 5,
  июля: 6,
  августа: 7,
  сентября: 8,
  октября: 9,
  ноября: 10,
  декабря: 11,
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function parseAbwDate(input: string, now: Date = new Date()): Date | null {
  const text = input.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!text) return null;

  const relative = /^(\d+)\s*(минут[а-яё]*|час[а-яё]*|д(?:ень|ня|ней))\s+назад$/.exec(text);
  if (relative) {
    const amount = Number(relative[1]);
    const unit = relative[2];
    const step = unit.startsWith('минут') ? MINUTE : unit.startsWith('час') ? HOUR : DAY;
    return new Date(now.getTime() - amount * step);
  }

  const today = /^сегодня в (\d{1,2}):(\d{2})$/.exec(text);
  if (today) return atTime(now, today[1], today[2]);

  const yesterday = /^вчера в (\d{1,2}):(\d{2})$/.exec(text);
  if (yesterday) {
    const date = new Date(now.getTime() - DAY);
    return atTime(date, yesterday[1], yesterday[2]);
  }

  const absolute = /^(\d{1,2}) ([а-яё]+)(?: (\d{4}))?$/.exec(text);
  if (absolute && absolute[2] in MONTHS) {
    return new Date(
      absolute[3] ? Number(absolute[3]) : now.getFullYear(),
      MONTHS[absolute[2]],
      Number(absolute[1]),
    );
  }

  return null;
}

function atTime(base: Date, hours: string, minutes: string): Date {
  const date = new Date(base);
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date;
}
