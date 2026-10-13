// Auto-generated mock data for src/lib/adminDemo.ts
// @cotester-version: 2
// Do not edit — regenerated on each source change.

import { mockInit } from './../__shared__/types.mock';

export const demoApiMocks = {
  'handles valid path': { path: 'src/utils/helper.ts', init: mockInit() },
  'handles empty path': { path: '', init: mockInit() },
  'handles rejection gracefully': { path: 'src/utils/helper.ts', init: mockInit() },
  'handles when p === "/api/admin/conversations"': {
    path: 'src/utils/helper.ts',
    init: mockInit(),
  },
  'handles when condition is not met': { path: '', init: mockInit() },
  'handles when p === "/api/admin/labels"': { path: 'src/utils/helper.ts', init: mockInit() },
  'handles when p === "/api/admin/inbox"': { path: 'src/utils/helper.ts', init: mockInit() },
  'handles when p === "/api/admin/canned"': { path: 'src/utils/helper.ts', init: mockInit() },
  'handles when m is truthy': { path: 'src/utils/helper.ts', init: mockInit() },
  'handles when m is falsy': { path: '', init: mockInit() },
  'handles when m[2] === "messages" && init.json === undefined': {
    path: 'src/utils/helper.ts',
    init: mockInit(),
  },
  'handles when m[2] === "messages" && conv': { path: 'src/utils/helper.ts', init: mockInit() },
  'handles when msg.private is falsy': { path: 'src/utils/helper.ts', init: mockInit() },
  'handles when msg.private is truthy': { path: '', init: mockInit() },
  'handles when m[2] === "topics" && conv': { path: 'src/utils/helper.ts', init: mockInit() },
  'handles when typeof body.note === "string" && body.note': {
    path: 'src/utils/helper.ts',
    init: mockInit(),
  },
  'handles when resolved is truthy': { path: 'src/utils/helper.ts', init: mockInit() },
  'handles when resolved is falsy': { path: '', init: mockInit() },
  'handles when m[2] === "status" && conv': { path: 'src/utils/helper.ts', init: mockInit() },
  'handles when conv.status === "open"': { path: 'src/utils/helper.ts', init: mockInit() },
  'handles when m[2] === "assign" && conv': { path: 'src/utils/helper.ts', init: mockInit() },
  'handles when m[2] === "read" && conv': { path: 'src/utils/helper.ts', init: mockInit() },
  'returns correctly when Array.isArray(body.close)': {
    path: 'src/utils/helper.ts',
    init: mockInit(),
  },
  'returns fallback when condition is not met': { path: '', init: mockInit() },
  'returns correctly when body.status === "resolved"': {
    path: 'src/utils/helper.ts',
    init: mockInit(),
  },
  'returns correctly when body.assigneeId === 1': { path: 'src/utils/helper.ts', init: mockInit() },
  'returns correctly when body.assigneeId === 2': { path: 'src/utils/helper.ts', init: mockInit() },
  'uses fallback when init.json is truthy is null/undefined': {
    path: 'src/utils/helper.ts',
    init: mockInit(),
  },
  'uses init.json is truthy value when defined': { path: '', init: mockInit() },
  'uses fallback when url.searchParams.get("status") is null/undefined': {
    path: 'src/utils/helper.ts',
    init: mockInit(),
  },
  'uses url.searchParams.get("status") value when defined': { path: '', init: mockInit() },
  'handles case when status === "all" || c.status === status': {
    path: 'src/utils/helper.ts',
    init: mockInit(),
  },
  'handles case when condition is not met': { path: '', init: mockInit() },
  'uses fallback when body.content is truthy is null/undefined': {
    path: 'src/utils/helper.ts',
    init: mockInit(),
  },
  'uses body.content is truthy value when defined': { path: '', init: mockInit() },
  'handles optional params omitted': { path: 'src/utils/helper.ts', init: mockInit() },
};
