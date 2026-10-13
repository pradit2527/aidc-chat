// Auto-generated mock data for src/app/api/admin/labels/route.ts
// @cotester-version: 2
// Do not edit — regenerated on each source change.

import { mockRequest } from './../../../../__shared__/types.mock';

export const GETMocks = {
  'handles valid request': { req: mockRequest() },
  'handles minimal request': { req: mockRequest() },
  'handles rejection gracefully': { req: mockRequest() },
  'verifies dependency interactions': { req: mockRequest() },
  'propagates error when dependency fails': { req: mockRequest() },
  'guards against invalid input (hit && Date.now() - hit.at < TTL_MS)': { req: mockRequest() },
  'proceeds with valid input': { req: mockRequest() },
  'returns correctly when typeof l.color === "string"': { req: mockRequest() },
  'returns fallback when condition is not met': { req: mockRequest() },
  'returns correctly when typeof l.description === "string"': { req: mockRequest() },
  'handles case when typeof l.title === "string" && (l.title as...': { req: mockRequest() },
  'handles case when condition is not met': { req: mockRequest() },
  'uses fallback when openByLabel.get(title) is null/undefined': { req: mockRequest() },
  'uses openByLabel.get(title) value when defined': { req: mockRequest() },
};
