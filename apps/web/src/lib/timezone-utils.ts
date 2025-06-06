/**
 * Timezone utilities for the frontend
 */

export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

/**
 * Get the user's browser timezone
 */
export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Get a list of common timezones for selection
 */
export function getTimezoneOptions(): TimezoneOption[] {
  const timezones = [
    // UTC
    {
      value: "UTC",
      label: "UTC (Coordinated Universal Time)",
      offset: "+00:00",
    },

    // North America
    {
      value: "America/New_York",
      label: "Eastern Time (ET)",
      offset: "-05:00/-04:00",
    },
    {
      value: "America/Chicago",
      label: "Central Time (CT)",
      offset: "-06:00/-05:00",
    },
    {
      value: "America/Denver",
      label: "Mountain Time (MT)",
      offset: "-07:00/-06:00",
    },
    {
      value: "America/Los_Angeles",
      label: "Pacific Time (PT)",
      offset: "-08:00/-07:00",
    },
    {
      value: "America/Anchorage",
      label: "Alaska Time (AKT)",
      offset: "-09:00/-08:00",
    },
    { value: "Pacific/Honolulu", label: "Hawaii Time (HST)", offset: "-10:00" },

    // Europe
    {
      value: "Europe/London",
      label: "British Time (GMT/BST)",
      offset: "+00:00/+01:00",
    },
    {
      value: "Europe/Paris",
      label: "Central European Time (CET)",
      offset: "+01:00/+02:00",
    },
    {
      value: "Europe/Berlin",
      label: "Central European Time (CET)",
      offset: "+01:00/+02:00",
    },
    {
      value: "Europe/Rome",
      label: "Central European Time (CET)",
      offset: "+01:00/+02:00",
    },
    {
      value: "Europe/Madrid",
      label: "Central European Time (CET)",
      offset: "+01:00/+02:00",
    },
    {
      value: "Europe/Amsterdam",
      label: "Central European Time (CET)",
      offset: "+01:00/+02:00",
    },
    {
      value: "Europe/Stockholm",
      label: "Central European Time (CET)",
      offset: "+01:00/+02:00",
    },
    {
      value: "Europe/Helsinki",
      label: "Eastern European Time (EET)",
      offset: "+02:00/+03:00",
    },
    {
      value: "Europe/Moscow",
      label: "Moscow Standard Time (MSK)",
      offset: "+03:00",
    },

    // Asia
    {
      value: "Asia/Tokyo",
      label: "Japan Standard Time (JST)",
      offset: "+09:00",
    },
    {
      value: "Asia/Shanghai",
      label: "China Standard Time (CST)",
      offset: "+08:00",
    },
    {
      value: "Asia/Hong_Kong",
      label: "Hong Kong Time (HKT)",
      offset: "+08:00",
    },
    {
      value: "Asia/Singapore",
      label: "Singapore Standard Time (SGT)",
      offset: "+08:00",
    },
    {
      value: "Asia/Seoul",
      label: "Korea Standard Time (KST)",
      offset: "+09:00",
    },
    {
      value: "Asia/Kolkata",
      label: "India Standard Time (IST)",
      offset: "+05:30",
    },
    {
      value: "Asia/Dubai",
      label: "Gulf Standard Time (GST)",
      offset: "+04:00",
    },

    // Australia & Oceania
    {
      value: "Australia/Sydney",
      label: "Australian Eastern Time (AET)",
      offset: "+10:00/+11:00",
    },
    {
      value: "Australia/Melbourne",
      label: "Australian Eastern Time (AET)",
      offset: "+10:00/+11:00",
    },
    {
      value: "Australia/Perth",
      label: "Australian Western Time (AWT)",
      offset: "+08:00",
    },
    {
      value: "Pacific/Auckland",
      label: "New Zealand Time (NZST)",
      offset: "+12:00/+13:00",
    },

    // Americas (South)
    {
      value: "America/Sao_Paulo",
      label: "Brasília Time (BRT)",
      offset: "-03:00/-02:00",
    },
    {
      value: "America/Argentina/Buenos_Aires",
      label: "Argentina Time (ART)",
      offset: "-03:00",
    },
    {
      value: "America/Santiago",
      label: "Chile Standard Time (CLT)",
      offset: "-04:00/-03:00",
    },

    // Africa
    {
      value: "Africa/Johannesburg",
      label: "South Africa Standard Time (SAST)",
      offset: "+02:00",
    },
    {
      value: "Africa/Cairo",
      label: "Eastern European Time (EET)",
      offset: "+02:00",
    },
    {
      value: "Africa/Lagos",
      label: "West Africa Time (WAT)",
      offset: "+01:00",
    },
  ];

  return timezones.sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Format timezone display with current offset
 */
export function formatTimezoneDisplay(timezone: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en", {
      timeZone: timezone,
      timeZoneName: "short",
    });

    const timeZoneName = formatter
      .formatToParts(now)
      .find((part) => part.type === "timeZoneName")?.value;

    const offset = getTimezoneOffset(timezone);

    return `${timezone.replace("_", " ")} (${timeZoneName}, UTC${offset})`;
  } catch {
    return timezone;
  }
}

/**
 * Get current UTC offset for a timezone
 */
export function getTimezoneOffset(timezone: string): string {
  try {
    const now = new Date();
    const utc = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
    const local = new Date(now.toLocaleString("en-US", { timeZone: timezone }));

    const offsetMs = local.getTime() - utc.getTime();
    const offsetHours = offsetMs / (1000 * 60 * 60);

    const sign = offsetHours >= 0 ? "+" : "-";
    const hours = Math.floor(Math.abs(offsetHours));
    const minutes = Math.floor((Math.abs(offsetHours) % 1) * 60);

    return `${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  } catch {
    return "+00:00";
  }
}

/**
 * Convert a time display based on user's timezone preference
 */
export function formatTimeInTimezone(date: Date, timezone: string): string {
  try {
    return date.toLocaleString("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return date.toLocaleString();
  }
}
