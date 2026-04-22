import { generateEventId, generateWamId } from "./idGenerators";

function isoNow() {
  return new Date().toISOString();
}

function unixNow() {
  return Math.floor(Date.now() / 1000);
}

export function buildInboundTextPayload({ from, to, body, customerName }) {
  const timestamp = isoNow();
  const wamId = generateWamId();

  return {
    id: generateEventId(),
    type: "whatsapp.inbound_message.received",
    apiVersion: "v2",
    createTime: timestamp,
    whatsappInboundMessage: {
      id: wamId,
      from,
      to,
      customerProfile: {
        name: customerName || from,
      },
      type: "text",
      text: {
        body,
      },
      timestamp: unixNow(),
    },
  };
}

export function buildInboundImagePayload({ from, to, caption, imageId, imageBase64 }) {
  const timestamp = isoNow();
  const wamId = generateWamId();

  return {
    _imageBase64: imageBase64 || null,
    id: generateEventId(),
    type: "whatsapp.inbound_message.received",
    apiVersion: "v2",
    createTime: timestamp,
    whatsappInboundMessage: {
      id: wamId,
      from,
      to,
      customerProfile: {
        name: from,
      },
      type: "image",
      image: {
        id: imageId || generateWamId(),
        caption: caption || "",
        mimeType: "image/jpeg",
        sha256: "placeholder_sha256",
      },
      timestamp: unixNow(),
    },
  };
}

export function buildInboundAudioPayload({ from, to, audioId, audioBase64 }) {
  const timestamp = isoNow();
  const wamId = generateWamId();

  return {
    _audioBase64: audioBase64 || null,
    id: generateEventId(),
    type: "whatsapp.inbound_message.received",
    apiVersion: "v2",
    createTime: timestamp,
    whatsappInboundMessage: {
      id: wamId,
      from,
      to,
      customerProfile: {
        name: from,
      },
      type: "audio",
      audio: {
        id: audioId || generateWamId(),
        mimeType: "audio/ogg; codecs=opus",
      },
      timestamp: unixNow(),
    },
  };
}

export function buildOutboundTextPayload({ from, to, body, wabaId }) {
  const timestamp = isoNow();
  const wamId = generateWamId();

  return {
    id: generateEventId(),
    type: "whatsapp.smb.message",
    apiVersion: "v2",
    createTime: timestamp,
    whatsappMessage: {
      id: wamId,
      wamid: wamId,
      wabaId: wabaId || "",
      from,
      to,
      type: "text",
      text: {
        body,
      },
      timestamp: unixNow(),
      status: "sent",
    },
  };
}
