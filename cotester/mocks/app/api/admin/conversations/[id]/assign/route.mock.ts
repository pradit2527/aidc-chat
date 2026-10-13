// Auto-generated mock data for src/app/api/admin/conversations/[id]/assign/route.ts
// @cotester-version: 2
// Do not edit — regenerated on each source change.

import { mockCtx, mockRequest } from './../../../../../../__shared__/types.mock';

export const POSTMocks = {
  'handles valid request': { req: mockRequest(), params: mockCtx() },
  'handles minimal request': { req: mockRequest(), params: mockCtx() },
  'handles rejection gracefully': { req: mockRequest(), params: mockCtx() },
  'verifies dependency interactions': { req: mockRequest(), params: mockCtx() },
  'propagates error when dependency fails': { req: mockRequest(), params: mockCtx() },
  'handles null/undefined (!id || assigneeId === undefined)': {
    req: mockRequest(),
    params: mockCtx(),
  },
  'proceeds when value exists': { req: mockRequest(), params: mockCtx() },
  'handles when raw is truthy': { req: mockRequest(), params: mockCtx() },
  'handles when raw is falsy': { req: mockRequest(), params: mockCtx() },
  'returns correctly when raw is null': { req: mockRequest(), params: mockCtx() },
  'returns fallback when raw is not null': { req: mockRequest(), params: mockCtx() },
  'returns correctly when typeof raw === "number" && Number.isInteger(raw) && raw > 0': {
    req: mockRequest(),
    params: mockCtx(),
  },
  'returns fallback when condition is not met': { req: mockRequest(), params: mockCtx() },
  'returns correctly when isObj(raw) && isObj(raw.payload)': {
    req: mockRequest(),
    params: mockCtx(),
  },
  'handles case when typeof raw === "number" && Number.isInteger(raw)': {
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
