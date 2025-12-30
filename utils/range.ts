import { TimeRange } from "@/types";

export const isWithinRange = (dateStr: string, range: TimeRange): boolean => {
  const date = new Date(dateStr);
  const baseDate = new Date('2023-10-25T12:00:00Z');
  const startOfToday = new Date(baseDate.setHours(0,0,0,0));
  const endOfToday = new Date(baseDate.setHours(23,59,59,999));

  switch (range) {
    case 'today': return date >= startOfToday && date <= endOfToday;
    case 'yesterday':
      const yest = new Date(startOfToday);
      yest.setDate(yest.getDate() - 1);
      return date >= yest && date <= new Date(endOfToday.setDate(endOfToday.getDate() - 1));
    case 'last_7_days':
      const seven = new Date(startOfToday);
      seven.setDate(seven.getDate() - 7);
      return date >= seven && date <= endOfToday;
    case 'this_week':
      const startOfWeek = new Date(startOfToday.getTime());
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      return date >= startOfWeek && date <= endOfToday;
    case 'this_month':
      return date >= new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1) && date <= endOfToday;
    default: return true;
  }
};