const ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const HEX = "0123456789abcdef";

function randomChars(charset, length) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => charset[byte % charset.length]).join("");
}

export function generateEventId() {
  return `evt_${randomChars(ALPHANUMERIC, 20)}`;
}

export function generateMessageId() {
  return `msg_${randomChars(HEX, 16)}`;
}

export function generateWamId() {
  return `wamid.${randomChars(ALPHANUMERIC, 22)}`;
}

export function generateUUID() {
  return crypto.randomUUID();
}
