// Auto-generated mock data for src/app/api/admin/conversations/route.ts
// @cotester-version: 2
// Do not edit — regenerated on each source change.

import { mockRequest } from './../../../../__shared__/types.mock';

export const GETMocks = {
  'handles valid request': { req: mockRequest() },
  'handles minimal request': { req: mockRequest() },
  'handles rejection gracefully': { req: mockRequest() },
  'verifies dependency interactions': { req: mockRequest() },
  'propagates error when dependency fails': { req: mockRequest() },
  'handles when /^[a-z0-9_-]{1,60}$/.test(label)': { req: mockRequest() },
  'handles when condition is not met': { req: mockRequest() },
  'handles when q.get("status") === "open"': { req: mockRequest() },
  'handles when conversations.length > 0': { req: mockRequest() },
  'handles when dbEnabled is truthy': { req: mockRequest() },
  'handles when dbEnabled is falsy': { req: mockRequest() },
  'handles when map.size is 0': { req: mockRequest() },
  'handles when map.size is not 0': { req: mockRequest() },
  'returns correctly when STATUSES.has(status)': { req: mockRequest() },
  'returns fallback when condition is not met': { req: mockRequest() },
  'returns correctly when e instanceof Error': { req: mockRequest() },
  'uses fallback when url.searchParams.get("status") is null/undefined': { req: mockRequest() },
  'uses url.searchParams.get("status") value when defined': { req: mockRequest() },
  'uses fallback when url.searchParams.get("label") is null/undefined': { req: mockRequest() },
  'uses url.searchParams.get("label") value when defined': { req: mockRequest() },
  'handles case when Number(url.searchParams.get("page")) || 1': { req: mockRequest() },
  'handles case when condition is not met': { req: mockRequest() },
  'uses fallback when map.get(c.id) is null/undefined': { req: mockRequest() },
  'uses map.get(c.id) value when defined': { req: mockRequest() },
  'succeeds without throwing': { req: mockRequest() },
  'handles error thrown inside try block': { req: mockRequest() },
};
