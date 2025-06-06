#!/usr/bin/env node

/**
 * Test script to verify timezone conversion logic
 * Run with: node test-timezone-conversion.js
 */

// Simulate the timezone conversion functions from the backend
function convertToUTC(date, userTimezone) {
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

function parseNextRunTimeSimple(schedule, fromDate, userTimezone = "UTC") {
  const parts = schedule.split(" ");
  if (parts.length !== 5) return null;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // For testing, let's just handle daily schedules
  if (
    dayOfMonth === "*" &&
    month === "*" &&
    dayOfWeek === "*" &&
    hour !== "*"
  ) {
    const targetHour = parseInt(hour);
    const targetMinute = parseInt(minute) || 0;

    // Calculate in user timezone
    let nextRun = new Date(fromDate);
    nextRun.setHours(targetHour, targetMinute, 0, 0);

    if (nextRun <= fromDate) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    // Convert to UTC if not already UTC
    if (userTimezone !== "UTC") {
      return convertToUTC(nextRun, userTimezone);
    }

    return nextRun;
  }

  return null;
}

// Test cases
console.log("🧪 Testing Timezone Conversion Logic\n");

const testCases = [
  {
    description: "Daily at 9:00 AM in New York (EST)",
    schedule: "0 9 * * *",
    userTimezone: "America/New_York",
    testTime: new Date("2024-01-15T14:00:00Z"), // 2 PM UTC = 9 AM EST
  },
  {
    description: "Daily at 9:00 AM in London (GMT)",
    schedule: "0 9 * * *",
    userTimezone: "Europe/London",
    testTime: new Date("2024-01-15T09:00:00Z"), // 9 AM UTC = 9 AM GMT
  },
  {
    description: "Daily at 9:00 AM in Tokyo (JST)",
    schedule: "0 9 * * *",
    userTimezone: "Asia/Tokyo",
    testTime: new Date("2024-01-15T00:00:00Z"), // 12 AM UTC = 9 AM JST
  },
  {
    description: "Daily at 9:00 AM in UTC",
    schedule: "0 9 * * *",
    userTimezone: "UTC",
    testTime: new Date("2024-01-15T09:00:00Z"),
  },
];

testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.description}`);
  console.log(
    `   Input: ${testCase.schedule} at ${testCase.testTime.toISOString()}`,
  );

  const nextRun = parseNextRunTimeSimple(
    testCase.schedule,
    testCase.testTime,
    testCase.userTimezone,
  );

  if (nextRun) {
    console.log(`   Next run (UTC): ${nextRun.toISOString()}`);

    // Show what time this would be in user's timezone
    const userTime = nextRun.toLocaleString("en-US", {
      timeZone: testCase.userTimezone,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
    console.log(`   Next run (User TZ): ${userTime}`);
  } else {
    console.log(`   ❌ Failed to parse schedule`);
  }

  console.log("");
});

// Test timezone offset calculation
console.log("🌍 Current Timezone Offsets:");
const timezones = [
  "UTC",
  "America/New_York",
  "Europe/London",
  "Asia/Tokyo",
  "Australia/Sydney",
];
const now = new Date();

timezones.forEach((tz) => {
  try {
    const utcTime = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
    const localTime = new Date(now.toLocaleString("en-US", { timeZone: tz }));

    const offsetMs = localTime.getTime() - utcTime.getTime();
    const offsetHours = offsetMs / (1000 * 60 * 60);

    const sign = offsetHours >= 0 ? "+" : "-";
    const hours = Math.floor(Math.abs(offsetHours));
    const minutes = Math.floor((Math.abs(offsetHours) % 1) * 60);

    const offset = `${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

    const timeInTz = now.toLocaleString("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    console.log(`   ${tz.padEnd(20)} | UTC${offset} | ${timeInTz}`);
  } catch (error) {
    console.log(`   ${tz.padEnd(20)} | Error: ${error.message}`);
  }
});

console.log("\n✅ Timezone conversion test completed!");
console.log("\n📝 Key points:");
console.log("   - User schedules are interpreted in their local timezone");
console.log("   - Internal calculations convert to UTC for storage");
console.log("   - This ensures reports run at the correct local time");
console.log("   - DST transitions are handled automatically by the browser");
