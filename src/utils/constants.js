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
  CLIENTS: "CLIENTS",
  DASHBOARD: "DASHBOARD",
};

export const ROLES = {
  ADMIN: "admin",
  CLIENT: "client",
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
  { value: "tone", labelKey: "cat.tone" },
  { value: "accuracy", labelKey: "cat.accuracy" },
  { value: "flow", labelKey: "cat.flow" },
  { value: "missing_info", labelKey: "cat.missing_info" },
  { value: "too_long", labelKey: "cat.too_long" },
  { value: "too_short", labelKey: "cat.too_short" },
  { value: "wrong_language", labelKey: "cat.wrong_language" },
  { value: "hallucination", labelKey: "cat.hallucination" },
  { value: "other", labelKey: "cat.other" },
];

export const ANNOTATION_SEVERITIES = [
  { value: "minor", labelKey: "sev.minor", color: "#FBBF24" },
  { value: "medium", labelKey: "sev.medium", color: "#F97316" },
  { value: "critical", labelKey: "sev.critical", color: "#EF4444" },
];

export const REACTIVATION_KEYWORD = "Listo✅";
