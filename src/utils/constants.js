export const STORAGE_KEYS = {
  projects: "botlab_projects",
  conversations: "botlab_conversations",
  activeProject: "botlab_activeProject",
  activeView: "botlab_activeView",
};

export const VIEWS = {
  SETTINGS: "SETTINGS",
  SIMULATOR: "SIMULATOR",
  TESTLAB: "TESTLAB",
};

export const BOT_STATUS = {
  ACTIVE: "ACTIVE",
  DEACTIVATED: "DEACTIVATED",
};

export const MESSAGE_STATUS = {
  SENDING: "SENDING",
  SENT: "SENT",
  DELIVERED: "DELIVERED",
  READ: "READ",
  FAILED: "FAILED",
};

export const ANNOTATION_CATEGORIES = [
  { value: "tone", label: "Tone" },
  { value: "accuracy", label: "Accuracy" },
  { value: "flow", label: "Flow" },
  { value: "missing_info", label: "Missing Info" },
  { value: "too_long", label: "Too Long" },
  { value: "too_short", label: "Too Short" },
  { value: "wrong_language", label: "Wrong Language" },
  { value: "hallucination", label: "Hallucination" },
  { value: "other", label: "Other" },
];

export const ANNOTATION_SEVERITIES = [
  { value: "minor", label: "Minor", color: "#FBBF24" },
  { value: "medium", label: "Medium", color: "#F97316" },
  { value: "critical", label: "Critical", color: "#EF4444" },
];

export const REACTIVATION_KEYWORD = "Listo✅";
