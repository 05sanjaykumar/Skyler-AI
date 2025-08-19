// apps/web/src/lib/crypto.ts
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const keyPromise = crypto.subtle.generateKey(
  { name: "AES-GCM", length: 256 },
  true,
  ["encrypt", "decrypt"]
);

export async function encryptText(text: string): Promise<ArrayBuffer> {
  const key = await keyPromise;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(text)
  );
  // Store both iv + encrypted for decryption
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  return combined.buffer;
}

export async function decryptText(buffer: ArrayBuffer): Promise<string> {
  const key = await keyPromise;
  const data = new Uint8Array(buffer);
  const iv = data.slice(0, 12);
  const encrypted = data.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted);
  return decoder.decode(decrypted);
}
