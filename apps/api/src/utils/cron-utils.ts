/**
 * Cron utilities for the backend scheduler
 */

/**
 * Calculate the next run time for a cron expression
 */
export function parseNextRunTime(
  schedule: string,
  fromDate: Date = new Date(),
): Date | null {
  const parts = schedule.split(" ");
  if (parts.length !== 5) return null;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  let nextRun = new Date(fromDate);

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
          if (nextRun <= fromDate) {
            nextRun.setHours(nextRun.getHours() + 1);
          }
        }
      } else if (hour.includes("/")) {
        // Every N hours
        const interval = parseInt(hour.split("/")[1]);
        const targetMinute = parseInt(minute) || 0;
        nextRun.setMinutes(targetMinute);
        nextRun.setSeconds(0, 0);

        let targetHour = Math.ceil(fromDate.getHours() / interval) * interval;
        if (targetHour > 23) {
          targetHour = 0;
          nextRun.setDate(nextRun.getDate() + 1);
        }
        nextRun.setHours(targetHour);

        if (nextRun <= fromDate) {
          nextRun.setHours(nextRun.getHours() + interval);
          if (nextRun.getHours() >= 24) {
            nextRun.setDate(nextRun.getDate() + 1);
            nextRun.setHours(nextRun.getHours() - 24);
          }
        }
      } else {
        // Daily at specific time
        const targetHour = parseInt(hour);
        const targetMinute = parseInt(minute) || 0;
        nextRun.setHours(targetHour, targetMinute, 0, 0);

        if (nextRun <= fromDate) {
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
        const currentDay = fromDate.getDay();

        let daysUntilNext = 0;
        if (currentDay >= start && currentDay <= end) {
          // We're in the range
          if (nextRun > fromDate) {
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
        const daysUntilTarget = (targetDay - fromDate.getDay() + 7) % 7;

        if (daysUntilTarget === 0 && nextRun <= fromDate) {
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

      if (nextRun <= fromDate) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
    } else {
      // Complex pattern - fallback to null
      return null;
    }

    return nextRun;
  } catch {
    return null;
  }
}

/**
 * Check if a cron schedule is due to run
 */
export function isScheduleDue(schedule: string, lastRunAt?: string): boolean {
  const now = new Date();

  // If never run before, it's due
  if (!lastRunAt) {
    return true;
  }

  const lastRun = new Date(lastRunAt);

  // Calculate next run time from the last run
  const nextRunTime = parseNextRunTime(schedule, lastRun);

  if (nextRunTime) {
    // Check if we've passed the next scheduled run time
    return now >= nextRunTime;
  }

  // Fallback: treat as daily and run if it's been more than 23 hours
  const timeSinceLastRun = now.getTime() - lastRun.getTime();
  return timeSinceLastRun > 23 * 60 * 60 * 1000;
}
