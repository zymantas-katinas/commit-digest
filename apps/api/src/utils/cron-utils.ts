/**
 * Cron utilities for the backend scheduler with timezone support
 */

/**
 * Convert a time from user timezone to UTC
 */
function convertToUTC(date: Date, userTimezone: string): Date {
  try {
    // Get the time in the user's timezone
    const userTimeString = date.toLocaleString("en-US", {
      timeZone: userTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // Parse it back to create a proper Date object in UTC
    const [datePart, timePart] = userTimeString.split(", ");
    const [month, day, year] = datePart.split("/");
    const [hour, minute, second] = timePart.split(":");

    const userTimeInUTC = new Date(
      `${year}-${month}-${day}T${hour}:${minute}:${second}Z`,
    );

    // Calculate the offset between what we expected and what we got
    const originalInUserTz = new Date(
      date.toLocaleString("en-US", { timeZone: userTimezone }),
    );
    const offsetMs = date.getTime() - originalInUserTz.getTime();

    return new Date(userTimeInUTC.getTime() + offsetMs);
  } catch (error) {
    console.error("Error converting timezone:", error);
    return date; // Fallback to original date
  }
}

/**
 * Convert a time from UTC to user timezone
 */
function convertFromUTC(date: Date, userTimezone: string): Date {
  try {
    // Create a new date object representing the same moment in the user's timezone
    const utcTime = date.getTime();
    const userTime = new Date(utcTime);

    // Get the timezone offset
    const utcDate = new Date(
      userTime.toLocaleString("en-US", { timeZone: "UTC" }),
    );
    const userDate = new Date(
      userTime.toLocaleString("en-US", { timeZone: userTimezone }),
    );
    const offset = utcDate.getTime() - userDate.getTime();

    return new Date(utcTime + offset);
  } catch (error) {
    console.error("Error converting from UTC:", error);
    return date; // Fallback to original date
  }
}

/**
 * Calculate the next run time for a cron expression in user's timezone
 */
export function parseNextRunTime(
  schedule: string,
  fromDate: Date = new Date(),
  userTimezone: string = "UTC",
): Date | null {
  const parts = schedule.split(" ");
  if (parts.length !== 5) return null;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Convert fromDate to user's timezone for calculation
  const userFromDate =
    userTimezone === "UTC" ? fromDate : convertFromUTC(fromDate, userTimezone);
  let nextRun = new Date(userFromDate);

  try {
    // Handle different cron patterns (calculations in user timezone)
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
          if (nextRun <= userFromDate) {
            nextRun.setHours(nextRun.getHours() + 1);
          }
        }
      } else if (hour.includes("/")) {
        // Every N hours
        const interval = parseInt(hour.split("/")[1]);
        const targetMinute = parseInt(minute) || 0;
        nextRun.setMinutes(targetMinute);
        nextRun.setSeconds(0, 0);

        let targetHour =
          Math.ceil(userFromDate.getHours() / interval) * interval;
        if (targetHour > 23) {
          targetHour = 0;
          nextRun.setDate(nextRun.getDate() + 1);
        }
        nextRun.setHours(targetHour);

        if (nextRun <= userFromDate) {
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

        if (nextRun <= userFromDate) {
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
        const currentDay = userFromDate.getDay();

        let daysUntilNext = 0;
        if (currentDay >= start && currentDay <= end) {
          // We're in the range
          if (nextRun > userFromDate) {
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
        const daysUntilTarget = (targetDay - userFromDate.getDay() + 7) % 7;

        if (daysUntilTarget === 0 && nextRun <= userFromDate) {
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

      if (nextRun <= userFromDate) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
    } else {
      // Complex pattern - fallback to null
      return null;
    }

    // Convert the calculated time back to UTC for storage/comparison
    return userTimezone === "UTC"
      ? nextRun
      : convertToUTC(nextRun, userTimezone);
  } catch {
    return null;
  }
}

/**
 * Check if a cron schedule is due to run (timezone-aware)
 */
export function isScheduleDue(
  schedule: string,
  lastRunAt?: string,
  userTimezone: string = "UTC",
): boolean {
  const now = new Date();

  // If never run before, it's due
  if (!lastRunAt) {
    return true;
  }

  const lastRun = new Date(lastRunAt);

  // Calculate next run time from the last run (in user's timezone)
  const nextRunTime = parseNextRunTime(schedule, lastRun, userTimezone);

  if (nextRunTime) {
    // Check if we've passed the next scheduled run time
    return now >= nextRunTime;
  }

  // Fallback: treat as daily and run if it's been more than 23 hours
  const timeSinceLastRun = now.getTime() - lastRun.getTime();
  return timeSinceLastRun > 23 * 60 * 60 * 1000;
}
