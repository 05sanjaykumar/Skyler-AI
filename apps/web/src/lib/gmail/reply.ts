// src/lib/reply.ts
import { findBestRule, fillTemplate, Rule } from "./rules-engine";

export type EmailPayload = {
  subject?: string | null;
  body?: string | null;
  from?: string | null;
  to?: string | null;
  snippet?: string | null;
};

export type DraftResult = {
  body: string;
  rule: Rule;
  score: number;
} | null;

/**
 * Try to find a matching rule and create a draft reply body.
 * Returns { body, rule, score } when a rule matches, otherwise null.
 */
export async function draftReplyFromRules(
  email: EmailPayload,
  rules: Rule[]
): Promise<DraftResult> {
  // Prefer body, then snippet, then subject as the text to be matched.
  const textForMatching =
    String(email.body ?? "").trim() ||
    String(email.snippet ?? "").trim() ||
    String(email.subject ?? "").trim();

  if (!textForMatching) return null;

  const match = await findBestRule(textForMatching, rules);
  if (!match) return null;

  const defaultTemplate = `Hi {{sender}},

{{auto_reply}}

Best,
{{me}}`;

  const tpl = match.rule.template ?? defaultTemplate;

  const sender = cleanSender(email.from);
  const body = fillTemplate(tpl, {
    sender,
    subject: String(email.subject ?? ""),
    snippet: String(email.snippet ?? ""),
    me: "", // optional — you can fill user's name from settings
    auto_reply: match.rule.text,
  });

  return { body, rule: match.rule, score: match.score };
}

/**
 * Opens a Gmail compose window (new tab). No server scopes required.
 * Returns false if not available (e.g. SSR).
 */
export function openGmailCompose(opts: {
  to?: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  body?: string;
}): boolean {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams();
  if (opts.to) params.set("to", opts.to);
  if (opts.cc) params.set("cc", opts.cc);
  if (opts.bcc) params.set("bcc", opts.bcc);
  if (opts.subject) params.set("su", opts.subject);
  if (opts.body) params.set("body", opts.body);

  const url = `https://mail.google.com/mail/?view=cm&fs=1&${params.toString()}`;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

/** Safely extract a readable sender string from `from`. */
function cleanSender(from?: string | null): string {
  // normalize to string
  const safe: string = String(from ?? "").trim();

  // explicitly grab first element as string
  const parts: string[] = safe.split("<");
  const display: string = (parts[0] ?? "").trim();

  // strip quotes
  return display.replace(/^"+|"+$/g, "");
}

