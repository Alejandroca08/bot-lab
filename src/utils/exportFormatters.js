import { ANNOTATION_SEVERITIES } from "./constants";

export function formatConversationJSON(conversation) {
  return JSON.stringify(conversation, null, 2);
}

export function formatConversationMarkdown(conversation) {
  const lines = [];
  const { name, id, createdAt, messages = [], annotations = [] } = conversation;

  // Header
  lines.push(`# Conversation Report`);
  lines.push("");
  lines.push(`- **Name:** ${name || "Untitled"}`);
  lines.push(`- **ID:** ${id || "N/A"}`);
  lines.push(`- **Created:** ${createdAt ? new Date(createdAt).toLocaleString() : "N/A"}`);
  lines.push(`- **Messages:** ${messages.length}`);
  lines.push(`- **Annotations:** ${annotations.length}`);
  lines.push("");

  // Transcript
  lines.push(`## Transcript`);
  lines.push("");

  if (messages.length === 0) {
    lines.push("_No messages._");
  } else {
    for (const msg of messages) {
      const sender = msg.direction === "inbound" ? "User" : "Bot";
      const time = msg.timestamp
        ? new Date(msg.timestamp).toLocaleTimeString()
        : "";
      const body = msg.text?.body || msg.body || "_[media]_";
      lines.push(`**${sender}** ${time ? `(${time})` : ""}`);
      lines.push(`> ${body}`);
      lines.push("");
    }
  }

  // Annotations
  lines.push(`## Annotations`);
  lines.push("");

  if (annotations.length === 0) {
    lines.push("_No annotations._");
  } else {
    const severityOrder = ["critical", "medium", "minor"];

    for (const severity of severityOrder) {
      const group = annotations.filter((a) => a.severity === severity);
      if (group.length === 0) continue;

      const severityMeta = ANNOTATION_SEVERITIES.find(
        (s) => s.value === severity
      );
      const label = severityMeta ? severityMeta.label : severity;

      lines.push(`### ${label} (${group.length})`);
      lines.push("");

      for (const ann of group) {
        const category = ann.category || "N/A";
        const messageRef = ann.messageId ? `Message: ${ann.messageId}` : "";
        lines.push(`- **${category}** ${messageRef}`);
        if (ann.comment) {
          lines.push(`  ${ann.comment}`);
        }
      }
      lines.push("");
    }
  }

  // Summary stats
  lines.push(`## Summary`);
  lines.push("");
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total messages | ${messages.length} |`);

  const inbound = messages.filter((m) => m.direction === "inbound").length;
  const outbound = messages.filter((m) => m.direction === "outbound").length;
  lines.push(`| User messages | ${inbound} |`);
  lines.push(`| Bot messages | ${outbound} |`);
  lines.push(`| Total annotations | ${annotations.length} |`);

  for (const sev of ANNOTATION_SEVERITIES) {
    const count = annotations.filter((a) => a.severity === sev.value).length;
    lines.push(`| ${sev.label} annotations | ${count} |`);
  }

  lines.push("");

  return lines.join("\n");
}

export function formatAnnotationsSummary(conversation) {
  const lines = [];
  const { annotations = [], messages = [] } = conversation;

  lines.push(`# Annotations Summary`);
  lines.push("");

  if (annotations.length === 0) {
    lines.push("_No annotations recorded._");
    return lines.join("\n");
  }

  const severityOrder = ["critical", "medium", "minor"];

  for (const severity of severityOrder) {
    const group = annotations.filter((a) => a.severity === severity);
    if (group.length === 0) continue;

    const severityMeta = ANNOTATION_SEVERITIES.find(
      (s) => s.value === severity
    );
    const label = severityMeta ? severityMeta.label : severity;

    lines.push(`## ${label} (${group.length})`);
    lines.push("");

    for (const ann of group) {
      const category = ann.category || "N/A";
      const messageRef = ann.messageId ? ` — Message: ${ann.messageId}` : "";
      lines.push(`- **${category}**${messageRef}`);
      if (ann.comment) {
        lines.push(`  ${ann.comment}`);
      }
    }
    lines.push("");
  }

  // Category breakdown
  const categoryCounts = {};
  for (const ann of annotations) {
    const cat = ann.category || "other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  lines.push(`## Stats`);
  lines.push("");
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total annotations | ${annotations.length} |`);

  for (const sev of ANNOTATION_SEVERITIES) {
    const count = annotations.filter((a) => a.severity === sev.value).length;
    lines.push(`| ${sev.label} | ${count} |`);
  }

  lines.push("");
  lines.push(`### By Category`);
  lines.push("");
  lines.push(`| Category | Count |`);
  lines.push(`|----------|-------|`);

  for (const [cat, count] of Object.entries(categoryCounts).sort(
    (a, b) => b[1] - a[1]
  )) {
    lines.push(`| ${cat} | ${count} |`);
  }

  lines.push("");

  return lines.join("\n");
}
