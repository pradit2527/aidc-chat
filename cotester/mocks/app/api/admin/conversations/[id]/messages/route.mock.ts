// Auto-generated mock data for src/app/api/admin/conversations/[id]/messages/route.ts
// @cotester-version: 2
// Do not edit — regenerated on each source change.

import { mockCtx, mockRequest } from './../../../../../../__shared__/types.mock';

export const GETMocks = {
  'handles valid request': { req: mockRequest(), params: mockCtx() },
  'handles minimal request': { req: mockRequest(), params: mockCtx() },
  'handles rejection gracefully': { req: mockRequest(), params: mockCtx() },
  'verifies dependency interactions': { req: mockRequest(), params: mockCtx() },
  'propagates error when dependency fails': { req: mockRequest(), params: mockCtx() },
  'handles null/undefined (id is falsy)': { req: mockRequest(), params: mockCtx() },
  'proceeds when value exists': { req: mockRequest(), params: mockCtx() },
  'returns correctly when before is truthy': { req: mockRequest(), params: mockCtx() },
  'returns fallback when before is falsy': { req: mockRequest(), params: mockCtx() },
  'uses fallback when new URL(req.url).searchParams.get("before") is null/undefined': {
    req: mockRequest(),
    params: mockCtx(),
  },
  'uses new URL(req.url).searchParams.get("before") value when defined': {
    req: mockRequest(),
    params: mockCtx(),
  },
  'handles case when a.createdAt - b.createdAt || a.id - b.id': {
    req: mockRequest(),
    params: mockCtx(),
  },
  'handles case when condition is not met': { req: mockRequest(), params: mockCtx() },
};

export const POSTMocks = {
  'handles valid request': { req: mockRequest(), params: mockCtx() },
  'handles minimal request': { req: mockRequest(), params: mockCtx() },
  'handles rejection gracefully': { req: mockRequest(), params: mockCtx() },
  'verifies dependency interactions': { req: mockRequest(), params: mockCtx() },
  'propagates error when dependency fails': { req: mockRequest(), params: mockCtx() },
  'handles null/undefined (id is falsy)': { req: mockRequest(), params: mockCtx() },
  'proceeds when value exists': { req: mockRequest(), params: mockCtx() },
  'guards against invalid input (!content || content.length > 5000)': {
    req: mockRequest(),
    params: mockCtx(),
  },
  'proceeds with valid input': { req: mockRequest(), params: mockCtx() },
  'handles when isNote is falsy': { req: mockRequest(), params: mockCtx() },
  'handles when isNote is truthy': { req: mockRequest(), params: mockCtx() },
  'returns correctly when typeof body?.content === "string"': {
    req: mockRequest(),
    params: mockCtx(),
  },
  'returns fallback when condition is not met': { req: mockRequest(), params: mockCtx() },
  'returns correctly when isNote is truthy': { req: mockRequest(), params: mockCtx() },
  'returns fallback when isNote is falsy': { req: mockRequest(), params: mockCtx() },
  'handles when body is truthy is defined': { req: mockRequest(), params: mockCtx() },
  'handles when body is truthy is null/undefined (optional chain short-circuits)': {
    req: mockRequest(),
    params: mockCtx(),
  },
};
