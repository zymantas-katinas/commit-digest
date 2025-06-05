#!/usr/bin/env node

/**
 * Debug script to help diagnose scheduler timing issues
 * Run with: node debug-scheduler-timing.js
 */

// Simulate the cron utilities (copy from apps/api/src/utils/cron-utils.ts)
function parseNextRunTimeDebug(schedule, fromDate = new Date()) {
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

function isScheduleDueDebug(schedule, lastRunAt) {
  const now = new Date();

  // If never run before, it's due
  if (!lastRunAt) {
    return true;
  }

  const lastRun = new Date(lastRunAt);

  // Calculate next run time from the last run
  const nextRunTime = parseNextRunTimeDebug(schedule, lastRun);

  if (nextRunTime) {
    // Check if we've passed the next scheduled run time
    return now >= nextRunTime;
  }

  // Fallback: treat as daily and run if it's been more than 23 hours
  const timeSinceLastRun = now.getTime() - lastRun.getTime();
  return timeSinceLastRun > 23 * 60 * 60 * 1000;
}

// Test scenarios
const now = new Date();
console.log(`🕐 Current time: ${now.toISOString()} (${now.toLocaleString()})`);
console.log(`📅 Day of week: ${now.getDay()} (0=Sunday, 1=Monday, etc.)`);
console.log("");

// Test various cron expressions
const testCases = [
  { schedule: "0 9 * * *", description: "Daily at 9:00 AM", lastRun: null },
  {
    schedule: "0 9 * * *",
    description: "Daily at 9:00 AM",
    lastRun: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
  }, // 25 hours ago
  { schedule: "0 */6 * * *", description: "Every 6 hours", lastRun: null },
  {
    schedule: "0 */6 * * *",
    description: "Every 6 hours",
    lastRun: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
  }, // 7 hours ago
  {
    schedule: "0 9 * * 1-5",
    description: "Weekdays at 9:00 AM",
    lastRun: null,
  },
  {
    schedule: "0 9 * * 1",
    description: "Weekly on Monday at 9:00 AM",
    lastRun: null,
  },
];

console.log("🧪 Testing cron expressions:");
testCases.forEach((testCase, index) => {
  const { schedule, description, lastRun } = testCase;

  console.log(`\n${index + 1}. ${description} (${schedule})`);
  console.log(`   Last run: ${lastRun || "never"}`);

  const nextRunTime = parseNextRunTimeDebug(
    schedule,
    lastRun ? new Date(lastRun) : new Date(),
  );
  const isDue = isScheduleDueDebug(schedule, lastRun);

  console.log(
    `   Next run: ${nextRunTime ? nextRunTime.toISOString() + ` (${nextRunTime.toLocaleString()})` : "unknown"}`,
  );
  console.log(`   Is due: ${isDue ? "✅ YES" : "❌ NO"}`);

  if (nextRunTime) {
    const timeUntilNext = nextRunTime.getTime() - now.getTime();
    const hoursUntil =
      Math.round((timeUntilNext / (1000 * 60 * 60)) * 100) / 100;
    console.log(`   Time until next: ${hoursUntil} hours`);
  }
});

console.log("\n🔍 To test your specific schedule:");
console.log("1. Note your current configuration's schedule and last_run_at");
console.log("2. Run this script to see when it should next run");
console.log("3. Check if the current time has passed that next run time");
console.log("\n💡 Common issues:");
console.log("• Scheduler runs every hour but configs may not be due yet");
console.log(
  "• Check timezone differences between your local time and server time",
);
console.log("• Verify the last_run_at timestamp is correct in the database");
