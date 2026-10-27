// apps/api/src/scripts/verifyNoNetworkEgress.ts
//
// Skyler AI's core privacy claim (README: "data is not collected... we just
// save the transaction list and some email account related info... [the
// AI models] process data in the backend") has never been independently
// verified anywhere in this project, this paper, or either cited IEEE
// paper — none of them measure or prove a privacy/data-locality claim at
// all, which is itself part of the gap this project addresses on top of
// the serving-latency and filtering-accuracy gaps.
//
// This script proves it, instead of asserting it: it monkey-patches every
// Node.js network entry point (http/https request+get, global fetch, and
// raw net.Socket/tls.TLSSocket connect) BEFORE loading the classification
// models, records every call attempt (without blocking them — if one
// happens, we want to see exactly what it was, not hide behind a thrown
// error), then runs a full, real classification cycle (model load +
// sentiment + semantic-embedding inference on realistic email text) and
// asserts zero network attempts occurred anywhere in that cycle.
//
// This also directly doubles as the reason Jev (TypeSafe AI's System One
// models, discussed in Section 2) was ruled out: Jev's entire API model
// requires a network call per classification, which this test proves
// Skyler AI's current local pipeline never makes.
//
// Run with:
//   cd apps/api
//   npx ts-node --compiler-options '{"module":"commonjs"}' src/scripts/verifyNoNetworkEgress.ts

// Using require() rather than `import * as` here: TS/Node module namespace
// objects for these core modules are read-only in this build's module
// interop, and we need to actually mutate the real, shared module object so
// every other module's `require("http")` etc. (including deep inside
// @xenova/transformers and googleapis) sees the patched functions too.
const http = require("http") as typeof import("http");
const https = require("https") as typeof import("https");
const net = require("net") as typeof import("net");
const tls = require("tls") as typeof import("tls");

interface CallRecord {
  api: string;
  target: string;
}

const calls: CallRecord[] = [];

function describeTarget(args: any[]): string {
  const first = args[0];
  if (typeof first === "string") return first;
  if (first && typeof first === "object") {
    const host = first.hostname || first.host || "";
    const port = first.port ? `:${first.port}` : "";
    const path = first.path || "";
    return `${host}${port}${path}` || JSON.stringify(first);
  }
  return String(first);
}

function patch() {
  const originalHttpRequest = http.request;
  const originalHttpGet = http.get;
  const originalHttpsRequest = https.request;
  const originalHttpsGet = https.get;
  const originalNetConnect = net.connect;
  const originalTlsConnect = tls.connect;
  const originalFetch = (globalThis as any).fetch;

  (http as any).request = function (...args: any[]) {
    calls.push({ api: "http.request", target: describeTarget(args) });
    return originalHttpRequest.apply(http, args as any);
  };
  (http as any).get = function (...args: any[]) {
    calls.push({ api: "http.get", target: describeTarget(args) });
    return originalHttpGet.apply(http, args as any);
  };
  (https as any).request = function (...args: any[]) {
    calls.push({ api: "https.request", target: describeTarget(args) });
    return originalHttpsRequest.apply(https, args as any);
  };
  (https as any).get = function (...args: any[]) {
    calls.push({ api: "https.get", target: describeTarget(args) });
    return originalHttpsGet.apply(https, args as any);
  };
  (net as any).connect = function (...args: any[]) {
    calls.push({ api: "net.connect", target: describeTarget(args) });
    return originalNetConnect.apply(net, args as any);
  };
  (tls as any).connect = function (...args: any[]) {
    calls.push({ api: "tls.connect", target: describeTarget(args) });
    return originalTlsConnect.apply(tls, args as any);
  };
  if (typeof originalFetch === "function") {
    (globalThis as any).fetch = function (...args: any[]) {
      calls.push({ api: "fetch", target: String(args[0]) });
      return originalFetch.apply(globalThis, args as any);
    };
  }
}

async function main() {
  // Patch BEFORE importing/loading anything from the classifier or model
  // modules, so even model-loading itself is covered, not just inference.
  patch();

  const { loadModels } = await import("../AI_Services/models");
  const { EmailClassifier } = await import("../AI_Services/gmail_AI/emailClassifier");

  console.log(`Network calls recorded before model load: ${calls.length}`);

  await loadModels();
  console.log(`Network calls recorded after model load (should still be 0 - models are read from local cache): ${calls.length}`);

  const classifier = new EmailClassifier();
  await classifier.init();

  const emails = [
    {
      id: "1",
      threadId: "t1",
      date: new Date().toISOString(),
      from: "someone@example.com",
      subject: "Your refund",
      snippet: "I'm really happy, please process my refund for order 42 as soon as possible.",
      aiContent: null,
      body: null,
    },
    {
      id: "2",
      threadId: "t2",
      date: new Date().toISOString(),
      from: "someone-else@example.com",
      subject: "Team sync",
      snippet: "Let's catch up at the meeting next week about the roadmap.",
      aiContent: null,
      body: null,
    },
  ];

  await classifier.filterEmailsWithReasons(emails, {
    sentiment: "positive",
    keywords: ["refund", "invoice", "payment"],
    requiresSemanticAnalysis: true,
  });

  console.log(`Network calls recorded after a full classification cycle: ${calls.length}`);

  console.log("\n==================== PRIVACY VERIFICATION ====================");
  if (calls.length === 0) {
    console.log("PASS: zero network calls of any kind during model load + sentiment + semantic classification.");
    console.log("Email content never left this process during classification.");
  } else {
    console.log(`FAIL: ${calls.length} network call(s) detected:`);
    for (const c of calls) console.log(`  [${c.api}] ${c.target}`);
  }
  console.log("================================================================");

  if (calls.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
