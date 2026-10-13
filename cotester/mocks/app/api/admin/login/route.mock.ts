// Auto-generated mock data for src/app/api/admin/login/route.ts
// @cotester-version: 2
// Do not edit — regenerated on each source change.

import { mockNextRequest } from './../../../../__shared__/types.mock';

export const POSTMocks = {
  'handles valid nextrequest': { req: mockNextRequest() },
  'handles minimal nextrequest': { req: mockNextRequest() },
  'handles rejection gracefully': { req: mockNextRequest() },
  'verifies dependency interactions': { req: mockNextRequest() },
  'propagates error when dependency fails': { req: mockNextRequest() },
  'guards against invalid input (!sameOrigin(req))': { req: mockNextRequest() },
  'proceeds with valid input': { req: mockNextRequest() },
  'guards against invalid input (!loginAllowed(ip))': { req: mockNextRequest() },
  'guards against invalid input (!email || !password || email.length > 200 ||...)': {
    req: mockNextRequest(),
  },
  'guards against invalid input (!process.env.SESSION_SECRET ||...)': { req: mockNextRequest() },
  'handles null/undefined (res.ok is falsy)': { req: mockNextRequest() },
  'proceeds when value exists': { req: mockNextRequest() },
  'guards against invalid input (!token || !client || !uid)': { req: mockNextRequest() },
  'guards against invalid input (!accounts.some((a) => String(a.id) === ACCOUNT_ID))': {
    req: mockNextRequest(),
  },
  'returns correctly when typeof body?.email === "string"': { req: mockNextRequest() },
  'returns fallback when condition is not met': { req: mockNextRequest() },
  'returns correctly when typeof body?.password === "string"': { req: mockNextRequest() },
  'returns correctly when Array.isArray(data.accounts)': { req: mockNextRequest() },
  'handles case when req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()...': {
    req: mockNextRequest(),
  },
  'handles case when condition is not met': { req: mockNextRequest() },
  'handles case when !email || !password || email.length > 200': { req: mockNextRequest() },
  'handles case when !email || !password': { req: mockNextRequest() },
  'uses fallback when ((await res.json().catch(() => ({}))) as { data?:... is null/undefined': {
    req: mockNextRequest(),
  },
  'uses ((await res.json().catch(() => ({}))) as { data?:... value when defined': {
    req: mockNextRequest(),
  },
  'handles case when !token || !client': { req: mockNextRequest() },
  'handles case when Number(data.id) || 0': { req: mockNextRequest() },
  'handles case when data.name || data.available_name || email': { req: mockNextRequest() },
  'handles case when data.name || data.available_name': { req: mockNextRequest() },
  'handles case when data.email || email': { req: mockNextRequest() },
  'handles when req.headers.get("x-forwarded-for")?.split(",")[0] is defined': {
    req: mockNextRequest(),
  },
  'handles when req.headers.get("x-forwarded-for")?.split(",")[0] is null/undefined (optional chain short-circuits)':
    { req: mockNextRequest() },
  'handles when req.headers.get("x-forwarded-for") is defined': { req: mockNextRequest() },
  'handles when req.headers.get("x-forwarded-for") is null/undefined (optional chain short-circuits)':
    { req: mockNextRequest() },
  'handles when body is truthy is defined': { req: mockNextRequest() },
  'handles when body is truthy is null/undefined (optional chain short-circuits)': {
    req: mockNextRequest(),
  },
  'succeeds without throwing': { req: mockNextRequest() },
  'handles error thrown inside try block': { req: mockNextRequest() },
};
