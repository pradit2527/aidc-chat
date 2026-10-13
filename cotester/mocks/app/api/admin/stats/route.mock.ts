// Auto-generated mock data for src/app/api/admin/stats/route.ts
// @cotester-version: 2
// Do not edit — regenerated on each source change.

import { mockRequest } from './../../../../__shared__/types.mock';

export const GETMocks = {
  'handles valid request': { req: mockRequest() },
  'handles minimal request': { req: mockRequest() },
  'handles rejection gracefully': { req: mockRequest() },
  'verifies dependency interactions': { req: mockRequest() },
  'propagates error when dependency fails': { req: mockRequest() },
  'handles null/undefined (dbEnabled is falsy)': { req: mockRequest() },
  'proceeds when value exists': { req: mockRequest() },
  'handles case when Number(new URL(req.url).searchParams.get("days")) || 14': {
    req: mockRequest(),
  },
  'handles case when condition is not met': { req: mockRequest() },
};
