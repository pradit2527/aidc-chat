// Auto-generated mock data for src/app/api/admin/conversations/[id]/status/route.ts
// @cotester-version: 2
// Do not edit — regenerated on each source change.

import { mockCtx, mockRequest } from './../../../../../../__shared__/types.mock';

export const POSTMocks = {
  'handles valid request': { req: mockRequest(), params: mockCtx() },
  'handles minimal request': { req: mockRequest(), params: mockCtx() },
  'handles rejection gracefully': { req: mockRequest(), params: mockCtx() },
  'verifies dependency interactions': { req: mockRequest(), params: mockCtx() },
  'propagates error when dependency fails': { req: mockRequest(), params: mockCtx() },
  'guards against invalid input (!id || (status !== "resolved" && status !== "open"))': {
    req: mockRequest(),
    params: mockCtx(),
  },
  'proceeds with valid input': { req: mockRequest(), params: mockCtx() },
  'handles when status === "open"': { req: mockRequest(), params: mockCtx() },
  'handles when condition is not met': { req: mockRequest(), params: mockCtx() },
  'handles when raw is truthy': { req: mockRequest(), params: mockCtx() },
  'handles when raw is falsy': { req: mockRequest(), params: mockCtx() },
  'returns correctly when isObj(raw) && isObj(raw.payload)': {
    req: mockRequest(),
    params: mockCtx(),
  },
  'returns fallback when condition is not met': { req: mockRequest(), params: mockCtx() },
  'handles case when status !== "resolved" && status !== "open"': {
    req: mockRequest(),
    params: mockCtx(),
  },
  'handles case when condition is not met': { req: mockRequest(), params: mockCtx() },
  'handles when body is truthy is defined': { req: mockRequest(), params: mockCtx() },
  'handles when body is truthy is null/undefined (optional chain short-circuits)': {
    req: mockRequest(),
    params: mockCtx(),
  },
};
