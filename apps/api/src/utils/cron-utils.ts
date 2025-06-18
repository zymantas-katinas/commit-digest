/**
 * Cron utilities for the backend scheduler with timezone support
 */

/**
 * Check if a cron schedule is due to run (timezone-aware)
 * This is the main function that determines if a report should be generated
 */
export function isScheduleDue(
  schedule: string,
  lastRunAt?: string,
  userTimezone: string = "UTC",
): boolean {
  const parts = schedule.split(" ");
  if (parts.length !== 5) return false;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // If never run before, it's due
  if (!lastRunAt) {
    return true;
  }

  const now = new Date();
  const lastRun = new Date(lastRunAt);

  // For daily schedules (most common case)
  if (
    dayOfMonth === "*" &&
    month === "*" &&
    dayOfWeek === "*" &&
    hour !== "*" &&
    !hour.includes("/")
  ) {
    const targetHour = parseInt(hour);
    const targetMinute = parseInt(minute) || 0;

    // Get current time in user's timezone
    const nowInUserTz = new Date().toLocaleString("en-US", {
      timeZone: userTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // Parse current time components in user timezone
    const [datePart, timePart] = nowInUserTz.split(", ");
    const [currentMonth, currentDay, currentYear] = datePart.split("/");
    const [currentHour, currentMinute] = timePart.split(":");

    const currentHourNum = parseInt(currentHour);
    const currentMinuteNum = parseInt(currentMinute);

    // Check if current time is past the scheduled time today
    const currentTimeMinutes = currentHourNum * 60 + currentMinuteNum;
    const targetTimeMinutes = targetHour * 60 + targetMinute;

    const isPassedScheduledTime = currentTimeMinutes >= targetTimeMinutes;

    // Get the date of the last run in user's timezone
    const lastRunInUserTz = new Date(lastRun).toLocaleDateString("en-US", {
      timeZone: userTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    // Get today's date in user's timezone
    const todayInUserTz = new Date().toLocaleDateString("en-US", {
      timeZone: userTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    // Check if we've already run today
    const hasRunToday = lastRunInUserTz === todayInUserTz;

    // IMPROVED LOGIC: Check if we've run at or after the scheduled time today
    let hasRunAtScheduledTimeToday = false;
    if (hasRunToday) {
      // Get the time of the last run in user's timezone
      const lastRunTimeInUserTz = new Date(lastRun).toLocaleString("en-US", {
        timeZone: userTimezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const [lastRunHour, lastRunMinute] = lastRunTimeInUserTz.split(":");
      const lastRunTimeMinutes =
        parseInt(lastRunHour) * 60 + parseInt(lastRunMinute);

      // Check if the last run was at or after the current scheduled time
      hasRunAtScheduledTimeToday = lastRunTimeMinutes >= targetTimeMinutes;
    }

    console.log(`🔍 Schedule check for ${schedule} in ${userTimezone}:`);
    console.log(
      `   Current time: ${currentHour}:${currentMinute} (${currentTimeMinutes} minutes)`,
    );
    console.log(
      `   Target time: ${targetHour}:${String(targetMinute).padStart(2, "0")} (${targetTimeMinutes} minutes)`,
    );
    console.log(`   Is past scheduled time: ${isPassedScheduledTime}`);
    console.log(`   Last run date (user tz): ${lastRunInUserTz}`);
    console.log(`   Today's date (user tz): ${todayInUserTz}`);
    console.log(`   Has run today: ${hasRunToday}`);
    console.log(
      `   Has run at/after scheduled time today: ${hasRunAtScheduledTimeToday}`,
    );

    // IMPROVED: Due if it's past the scheduled time today AND we haven't run at or after the scheduled time today
    const isDue = isPassedScheduledTime && !hasRunAtScheduledTimeToday;
    console.log(`   Is due: ${isDue}`);

    return isDue;
  }

  // For hourly schedules
  if (
    dayOfMonth === "*" &&
    month === "*" &&
    dayOfWeek === "*" &&
    hour === "*"
  ) {
    const targetMinute = parseInt(minute) || 0;

    // Get current time in user's timezone
    const nowInUserTz = new Date().toLocaleString("en-US", {
      timeZone: userTimezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const [currentHour, currentMinute] = nowInUserTz.split(":");
    const currentMinuteNum = parseInt(currentMinute);

    // For hourly schedules, check if we've passed the target minute this hour
    const isPassedScheduledMinute = currentMinuteNum >= targetMinute;

    // Check if we've run in the current hour
    const currentHourStart = new Date();
    currentHourStart.setMinutes(0, 0, 0);

    const hasRunThisHour = lastRun >= currentHourStart;

    console.log(`🔍 Hourly schedule check for ${schedule} in ${userTimezone}:`);
    console.log(`   Current time: ${currentHour}:${currentMinute}`);
    console.log(`   Target minute: ${targetMinute}`);
    console.log(`   Is past scheduled minute: ${isPassedScheduledMinute}`);
    console.log(`   Has run this hour: ${hasRunThisHour}`);

    // Due if we've passed the target minute this hour AND haven't run this hour
    const isDue = isPassedScheduledMinute && !hasRunThisHour;
    console.log(`   Is due: ${isDue}`);

    return isDue;
  }

  // For other schedule types, use simpler logic
  const nextRunTime = parseNextRunTime(schedule, lastRun, userTimezone);
  if (nextRunTime) {
    return now >= nextRunTime;
  }

  // Fallback: run if it's been more than 23 hours
  const timeSinceLastRun = now.getTime() - lastRun.getTime();
  return timeSinceLastRun > 23 * 60 * 60 * 1000;
}

/**
 * Calculate the next run time for a cron expression in user's timezone
 * This is mainly used for logging and non-daily schedules
 */
export function parseNextRunTime(
  schedule: string,
  fromDate: Date = new Date(),
  userTimezone: string = "UTC",
): Date | null {
  const parts = schedule.split(" ");
  if (parts.length !== 5) return null;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  try {
    const now = new Date();
    const baseDate = fromDate > now ? fromDate : now;

    // For daily schedules
    if (
      dayOfMonth === "*" &&
      month === "*" &&
      dayOfWeek === "*" &&
      hour !== "*" &&
      !hour.includes("/")
    ) {
      const targetHour = parseInt(hour);
      const targetMinute = parseInt(minute) || 0;

      // Calculate tomorrow's target time in UTC
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get tomorrow's date in user timezone
      const tomorrowInUserTz = tomorrow.toLocaleDateString("en-CA", {
        timeZone: userTimezone,
      });

      // Create target time string
      const targetTimeStr = `${tomorrowInUserTz}T${String(targetHour).padStart(2, "0")}:${String(targetMinute).padStart(2, "0")}:00`;

      // Convert to UTC (this is approximate but good enough for logging)
      if (userTimezone === "UTC") {
        return new Date(targetTimeStr + "Z");
      } else {
        // For non-UTC, we'll create a reasonable approximation
        // This is mainly for logging purposes
        const tempDate = new Date(targetTimeStr);

        // Get approximate offset
        const offsetHours = userTimezone === "Europe/Stockholm" ? -2 : 0; // Simplified
        tempDate.setHours(tempDate.getHours() - offsetHours);

        return tempDate;
      }
    }

    // For hourly schedules
    if (
      dayOfMonth === "*" &&
      month === "*" &&
      dayOfWeek === "*" &&
      hour === "*"
    ) {
      const targetMinute = parseInt(minute) || 0;
      const nextRun = new Date(baseDate);

      // Set to the target minute of the current hour
      nextRun.setMinutes(targetMinute, 0, 0);

      // If we've passed that time this hour, move to next hour
      if (nextRun <= baseDate) {
        nextRun.setHours(nextRun.getHours() + 1);
      }

      return nextRun;
    }

    // For other patterns, use basic UTC logic
    let nextRun = new Date(baseDate);

    if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
      // Other hourly patterns
      if (hour === "*") {
        const targetMinute = parseInt(minute) || 0;
        nextRun.setMinutes(targetMinute, 0, 0);
        if (nextRun <= baseDate) {
          nextRun.setHours(nextRun.getHours() + 1);
        }
      }
    }

    return nextRun;
  } catch (error) {
    console.error("Error in parseNextRunTime:", error);
    return null;
  }
}
