// Enums for report configuration settings
// Following the workspace rule for using uppercase with underscores for enum members

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

// Default values for the settings as specified in the user requirements
export const REPORT_CONFIGURATION_DEFAULTS = {
  REPORT_STYLE: REPORT_STYLE.STANDARD,
  TONE_OF_VOICE: TONE_OF_VOICE.INFORMATIVE,
  AUTHOR_DISPLAY: false, // false = hide author names, true = show author names
  LINK_TO_COMMITS: false,
  IF_NO_UPDATES: true, // true = send "No Updates" message, false = send nothing
} as const;
