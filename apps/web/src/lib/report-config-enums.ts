// Frontend enums for report configuration settings
// These match the backend enums and should be kept in sync

export enum REPORT_STYLE {
  SUMMARY = "Summary",
  STANDARD = "Standard",
  CHANGELOG = "Changelog",
}

export enum TONE_OF_VOICE {
  PROFESSIONAL = "Professional",
  INFORMATIVE = "Informative",
  FRIENDLY_CASUAL = "Friendly & Casual",
}

// Default values for the settings
export const REPORT_CONFIGURATION_DEFAULTS = {
  REPORT_STYLE: REPORT_STYLE.STANDARD,
  TONE_OF_VOICE: TONE_OF_VOICE.INFORMATIVE,
  AUTHOR_DISPLAY: false, // false = hide author names, true = show author names
  LINK_TO_COMMITS: false,
  IF_NO_UPDATES: true, // true = send "No Updates" message, false = send nothing
} as const;

// Option arrays for UI selects
export const REPORT_STYLE_OPTIONS = [
  { value: REPORT_STYLE.SUMMARY, label: "Summary" },
  { value: REPORT_STYLE.STANDARD, label: "Standard" },
  { value: REPORT_STYLE.CHANGELOG, label: "Changelog" },
];

export const TONE_OF_VOICE_OPTIONS = [
  { value: TONE_OF_VOICE.PROFESSIONAL, label: "Professional" },
  { value: TONE_OF_VOICE.INFORMATIVE, label: "Informative" },
  { value: TONE_OF_VOICE.FRIENDLY_CASUAL, label: "Friendly & Casual" },
];
