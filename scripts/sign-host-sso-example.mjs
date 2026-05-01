#!/usr/bin/env node
/**
 * Example: build a Host SSO assertion for X-Buzzy-Host-Identity.
 * Usage:
 *   BUZZY_PROJECT_ID=<uuid> BUZZY_HOST_SSO_SECRET=<secret> node scripts/sign-host-sso-example.mjs
 *
 * Output: one line token to pass to Buzzy.setHostIdentity(...) or Buzzy.init({ hostIdentity: "..." }).
 */
import { createHmac, randomUUID } from "crypto";

const secret = process.env.BUZZY_HOST_SSO_SECRET || "";
const pid = process.env.BUZZY_PROJECT_ID || "";
if (!secret || !pid) {
  console.error("Set BUZZY_HOST_SSO_SECRET and BUZZY_PROJECT_ID");
  process.exit(1);
}

const now = Math.floor(Date.now() / 1000);
const exp = now + 10 * 60;
const payload = {
  pid,
  sub: process.env.BUZZY_SUB || "user_" + randomUUID().slice(0, 8),
  name: process.env.BUZZY_NAME || "Ada Lovelace",
  email: process.env.BUZZY_EMAIL || "",
  avatar: process.env.BUZZY_AVATAR || "https://example.com/avatar.png",
  username: process.env.BUZZY_USERNAME || "adal",
  iat: now,
  exp,
};

if (!payload.email) delete payload.email;
if (!payload.avatar) delete payload.avatar;
if (!payload.username) delete payload.username;

const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
const sig = createHmac("sha256", secret).update(payloadB64).digest("base64url");
console.log(`${payloadB64}.${sig}`);
