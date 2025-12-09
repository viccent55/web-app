import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";

dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

export const formatTime = (timestamp: string | number | Date) => {
  let date: dayjs.Dayjs;

  if (typeof timestamp === "number") {
    // Handle both seconds and milliseconds
    date = timestamp > 9999999999 ? dayjs(timestamp) : dayjs.unix(timestamp);
  } else if (typeof timestamp === "string") {
    if (/^\d+$/.test(timestamp)) {
      const num = parseInt(timestamp);
      date = num > 9999999999 ? dayjs(num) : dayjs.unix(num);
    } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(timestamp)) {
      date = dayjs(timestamp, "YYYY-MM-DD HH:mm:ss", true); // strict mode
    } else {
      date = dayjs(timestamp);
    }
  } else {
    date = dayjs(timestamp);
  }

  if (!date.isValid()) return "";

  const now = dayjs();
  
  // Today - show time only
  if (date.isToday()) {
    return date.format("HH:mm");
  }
  
  // Yesterday - show "昨天 + time"
  if (date.isYesterday()) {
    return `昨天 ${date.format("HH:mm")}`;
  }
  
  // Within this week - show day of week + time
  const diffDays = now.diff(date, "day");
  if (diffDays < 7) {
    const daysOfWeek = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return `${daysOfWeek[date.day()]} ${date.format("HH:mm")}`;
  }
  
  // This year - show month and day
  if (date.year() === now.year()) {
    return date.format("MM-DD HH:mm");
  }
  
  // Previous years - show full date
  return date.format("YYYY-MM-DD HH:mm");
};

// Alternative: More RedNote-like format (shorter version)
export const formatTimeRedNoteStyle = (timestamp: string | number | Date) => {
  let date: dayjs.Dayjs;

  // Same parsing logic as above...
  if (typeof timestamp === "number") {
    date = timestamp > 9999999999 ? dayjs(timestamp) : dayjs.unix(timestamp);
  } else if (typeof timestamp === "string") {
    if (/^\d+$/.test(timestamp)) {
      const num = parseInt(timestamp);
      date = num > 9999999999 ? dayjs(num) : dayjs.unix(num);
    } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(timestamp)) {
      date = dayjs(timestamp, "YYYY-MM-DD HH:mm:ss", true);
    } else {
      date = dayjs(timestamp);
    }
  } else {
    date = dayjs(timestamp);
  }

  if (!date.isValid()) return "";

  const now = dayjs();
  const diffMinutes = now.diff(date, "minute");
  const diffHours = now.diff(date, "hour");
  const diffDays = now.diff(date, "day");

  // Just now (within 1 minute)
  if (diffMinutes < 1) return "刚刚";
  
  // Minutes ago
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  
  // Hours ago
  if (diffHours < 24) return `${diffHours}小时前`;
  
  // Yesterday
  if (date.isYesterday()) return "昨天";
  
  // This week
  if (diffDays < 7) {
    const daysOfWeek = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return daysOfWeek[date.day()];
  }
  
  // This year
  if (date.year() === now.year()) {
    return date.format("M月D日");
  }
  
  // Previous years
  return date.format("YYYY年M月D日");
};