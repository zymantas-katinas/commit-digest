/**
 * Cron expression utilities for parsing and displaying schedules
 */

// Predefined schedule mappings
const PREDEFINED_SCHEDULES: Record<string, string> = {
  "0 9 * * *": "Daily at 9:00 AM",
  "0 7 * * *": "Daily at 7:00 AM",
  "0 9 * * 1": "Weekly on Monday at 9:00 AM",
  "0 9 1 * *": "Monthly on the 1st at 9:00 AM",
  "0 */6 * * *": "Every 6 hours",
  "0 9 * * 1-5": "Weekdays at 9:00 AM",
};

// Day names for display
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Ordinal numbers for monthly displays
const ORDINALS = [
  "",
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
  "13th",
  "14th",
  "15th",
  "16th",
  "17th",
  "18th",
  "19th",
  "20th",
  "21st",
  "22nd",
  "23rd",
  "24th",
  "25th",
  "26th",
  "27th",
  "28th",
  "29th",
  "30th",
  "31st",
];

/**
 * Parse a cron expression and return a human-readable description
 */
export function getScheduleDisplay(schedule: string): string {
  // First check predefined schedules
  if (PREDEFINED_SCHEDULES[schedule]) {
    return PREDEFINED_SCHEDULES[schedule];
  }

  // Parse custom cron expressions for better display
  const parts = schedule.split(" ");
  if (parts.length !== 5) {
    return schedule; // Invalid cron, show as-is
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Try to generate a human-readable description
  try {
    let description = "";

    // Handle frequency patterns
    if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
      // Daily or hourly patterns
      if (hour === "*") {
        if (minute === "*") {
          description = "Every minute";
        } else if (minute.includes("/")) {
          const interval = minute.split("/")[1];
          description = `Every ${interval} minutes`;
        } else {
          description = `Every hour at :${minute.padStart(2, "0")}`;
        }
      } else if (hour.includes("/")) {
        const interval = hour.split("/")[1];
        const time = minute === "0" ? "" : `:${minute.padStart(2, "0")}`;
        description = `Every ${interval} hours${time}`;
      } else {
        const time = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
        description = `Daily at ${time}`;
      }
    } else if (dayOfMonth === "*" && month === "*" && dayOfWeek !== "*") {
      // Weekly patterns
      const time = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;

      if (dayOfWeek.includes("-")) {
        const [start, end] = dayOfWeek.split("-").map(Number);
        description = `${DAY_NAMES[start]}-${DAY_NAMES[end]} at ${time}`;
      } else if (dayOfWeek.includes(",")) {
        const days = dayOfWeek
          .split(",")
          .map((d) => DAY_NAMES[Number(d)])
          .join(", ");
        description = `${days} at ${time}`;
      } else {
        description = `Weekly on ${DAY_NAMES[Number(dayOfWeek)]} at ${time}`;
      }
    } else if (dayOfMonth !== "*" && month === "*" && dayOfWeek === "*") {
      // Monthly patterns
      const time = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;

      if (dayOfMonth.includes(",")) {
        const days = dayOfMonth
          .split(",")
          .map((d) => ORDINALS[Number(d)])
          .join(", ");
        description = `Monthly on ${days} at ${time}`;
      } else {
        description = `Monthly on ${ORDINALS[Number(dayOfMonth)]} at ${time}`;
      }
    } else {
      // Complex pattern, show the cron expression
      description = schedule;
    }

    return description;
  } catch {
    return schedule; // Fallback to raw cron expression
  }
}

/**
 * Parse a cron expression and calculate the next run time
 */
export function parseNextRunTime(schedule: string): Date | null {
  const parts = schedule.split(" ");
  if (parts.length !== 5) return null;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  const now = new Date();
  let nextRun = new Date(now);

  try {
    // Handle different cron patterns
    if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
      // Daily or hourly patterns
      if (hour === "*") {
        // Hourly pattern
        if (minute === "*") {
          // Every minute
          nextRun.setSeconds(0, 0);
          nextRun.setMinutes(nextRun.getMinutes() + 1);
        } else {
          // Specific minute each hour
          const targetMinute = parseInt(minute);
          nextRun.setSeconds(0, 0);
          nextRun.setMinutes(targetMinute);
          if (nextRun <= now) {
            nextRun.setHours(nextRun.getHours() + 1);
          }
        }
      } else if (hour.includes("/")) {
        // Every N hours
        const interval = parseInt(hour.split("/")[1]);
        const targetMinute = parseInt(minute) || 0;
        nextRun.setMinutes(targetMinute);
        nextRun.setSeconds(0, 0);

        let targetHour = Math.ceil(now.getHours() / interval) * interval;
        if (targetHour > 23) {
          targetHour = 0;
          nextRun.setDate(nextRun.getDate() + 1);
        }
        nextRun.setHours(targetHour);

        if (nextRun <= now) {
          nextRun.setHours(nextRun.getHours() + interval);
        }
      } else {
        // Daily at specific time
        const targetHour = parseInt(hour);
        const targetMinute = parseInt(minute) || 0;
        nextRun.setHours(targetHour, targetMinute, 0, 0);

        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
      }
    } else if (dayOfMonth === "*" && month === "*" && dayOfWeek !== "*") {
      // Weekly patterns
      const targetHour = parseInt(hour) || 9;
      const targetMinute = parseInt(minute) || 0;
      nextRun.setHours(targetHour, targetMinute, 0, 0);

      if (dayOfWeek.includes("-")) {
        // Range of days (e.g., 1-5 for Mon-Fri)
        const [start, end] = dayOfWeek.split("-").map(Number);
        const currentDay = now.getDay();

        let daysUntilNext = 0;
        if (currentDay >= start && currentDay <= end) {
          // We're in the range
          if (nextRun > now) {
            // Today is fine
            daysUntilNext = 0;
          } else {
            // Move to next day in range, or start of next week's range
            if (currentDay < end) {
              daysUntilNext = 1;
            } else {
              daysUntilNext = (start - currentDay + 7) % 7;
            }
          }
        } else {
          // We're outside the range
          daysUntilNext = (start - currentDay + 7) % 7;
        }

        nextRun.setDate(nextRun.getDate() + daysUntilNext);
      } else {
        // Specific day
        const targetDay = parseInt(dayOfWeek);
        const daysUntilTarget = (targetDay - now.getDay() + 7) % 7;

        if (daysUntilTarget === 0 && nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 7);
        } else {
          nextRun.setDate(nextRun.getDate() + daysUntilTarget);
        }
      }
    } else if (dayOfMonth !== "*" && month === "*" && dayOfWeek === "*") {
      // Monthly patterns
      const targetDay = parseInt(dayOfMonth);
      const targetHour = parseInt(hour) || 9;
      const targetMinute = parseInt(minute) || 0;

      nextRun.setDate(targetDay);
      nextRun.setHours(targetHour, targetMinute, 0, 0);

      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
    } else {
      // Complex pattern - fallback to a simple heuristic
      return null;
    }

    return nextRun;
  } catch {
    return null;
  }
}

/**
 * Format time difference into human-readable string
 */
function formatTimeDifference(timeDiff: number): string {
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return "Soon";
  }
}

/**
 * Get the next run time for a cron schedule with fallback logic
 */
export function getNextRunTime(schedule: string, enabled: boolean): string {
  if (!enabled) {
    return "Paused";
  }

  const now = new Date();

  // Try custom parser first
  const nextRun = parseNextRunTime(schedule);

  if (nextRun) {
    const timeDiff = nextRun.getTime() - now.getTime();
    return formatTimeDifference(timeDiff);
  }

  // Fallback to hardcoded logic for specific known patterns
  let nextRunFallback: Date;
  switch (schedule) {
    case "0 9 * * *": // Daily at 9:00 AM
      nextRunFallback = new Date(now);
      nextRunFallback.setHours(9, 0, 0, 0);
      if (nextRunFallback <= now) {
        nextRunFallback.setDate(nextRunFallback.getDate() + 1);
      }
      break;
    case "0 9 * * 1": // Weekly on Monday at 9:00 AM
      nextRunFallback = new Date(now);
      nextRunFallback.setHours(9, 0, 0, 0);
      const daysUntilMonday = (1 - now.getDay() + 7) % 7;
      if (daysUntilMonday === 0 && nextRunFallback <= now) {
        nextRunFallback.setDate(nextRunFallback.getDate() + 7);
      } else {
        nextRunFallback.setDate(nextRunFallback.getDate() + daysUntilMonday);
      }
      break;
    case "0 9 1 * *": // Monthly on the 1st at 9:00 AM
      nextRunFallback = new Date(now);
      nextRunFallback.setDate(1);
      nextRunFallback.setHours(9, 0, 0, 0);
      if (nextRunFallback <= now) {
        nextRunFallback.setMonth(nextRunFallback.getMonth() + 1);
      }
      break;
    default:
      return "Unknown schedule";
  }

  const timeDiff = nextRunFallback.getTime() - now.getTime();
  return formatTimeDifference(timeDiff);
}

/**
 * Validate a cron expression format
 */
export function isValidCronExpression(schedule: string): boolean {
  const cronRegex =
    /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;
  return cronRegex.test(schedule);
}
