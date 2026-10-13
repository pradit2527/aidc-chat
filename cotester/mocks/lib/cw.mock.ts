// Auto-generated mock data for src/lib/cw.ts
// @cotester-version: 2
// Do not edit — regenerated on each source change.

import { mockSession } from './../__shared__/types.mock';

export const cwMocks = {
  'handles valid session': {
    s: mockSession(),
    path: 'src/utils/helper.ts',
    init: { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any,
  },
  'handles minimal session': {
    s: mockSession(),
    path: '',
    init: {} as any /* minimal { method?: string; json?: unknown; } */,
  },
  'verifies dependency interactions': {
    s: mockSession(),
    path: 'src/utils/helper.ts',
    init: { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any,
  },
  'propagates error when dependency fails': {
    s: mockSession(),
    path: 'src/utils/helper.ts',
    init: { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any,
  },
  'handles null/undefined (res.ok is falsy)': {
    s: mockSession(),
    path: 'src/utils/helper.ts',
    init: { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any,
  },
  'proceeds when value exists': {
    s: mockSession(),
    path: '',
    init: {} as any /* minimal { method?: string; json?: unknown; } */,
  },
  'guards against invalid input (res.status === 204)': {
    s: mockSession(),
    path: 'src/utils/helper.ts',
    init: { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any,
  },
  'proceeds with valid input': {
    s: mockSession(),
    path: '',
    init: {} as any /* minimal { method?: string; json?: unknown; } */,
  },
  'returns correctly when init.json is not undefined': {
    s: mockSession(),
    path: 'src/utils/helper.ts',
    init: { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any,
  },
  'returns fallback when init.json is undefined': {
    s: mockSession(),
    path: '',
    init: {} as any /* minimal { method?: string; json?: unknown; } */,
  },
  'returns correctly when text is truthy': {
    s: mockSession(),
    path: 'src/utils/helper.ts',
    init: { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any,
  },
  'returns fallback when text is falsy': {
    s: mockSession(),
    path: '',
    init: {} as any /* minimal { method?: string; json?: unknown; } */,
  },
  'uses fallback when init.method is truthy is null/undefined': {
    s: mockSession(),
    path: 'src/utils/helper.ts',
    init: { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any,
  },
  'uses init.method is truthy value when defined': {
    s: mockSession(),
    path: '',
    init: {} as any /* minimal { method?: string; json?: unknown; } */,
  },
  'succeeds without throwing': {
    s: mockSession(),
    path: 'src/utils/helper.ts',
    init: { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any,
  },
  'handles error thrown inside try block': {
    s: mockSession(),
    path: '',
    init: {} as any /* minimal { method?: string; json?: unknown; } */,
  },
  'handles optional params omitted': {
    s: mockSession(),
    path: 'src/utils/helper.ts',
    init: undefined,
  },
};

export const toConversationMocks = {
  'handles default case': { raw: {} as any },
  'returns correctly when awaitingReply is truthy': { raw: {} as any },
  'returns fallback when awaitingReply is falsy': { raw: {} as any },
  'returns correctly when num(assignee.id)': { raw: {} as any },
  'returns fallback when condition is not met': { raw: {} as any },
  'uses fallback when c.last_non_activity_message is truthy is null/undefined': { raw: {} as any },
  'uses c.last_non_activity_message is truthy value when defined': { raw: {} as any },
  'uses fallback when (["open", "resolved", "pending", "snoozed"] as... is null/undefined': {
    raw: {} as any,
  },
  'uses (["open", "resolved", "pending", "snoozed"] as... value when defined': { raw: {} as any },
  'handles case when kind === 0 || kind === "incoming"': { raw: {} as any },
  'handles case when condition is not met': { raw: {} as any },
  'handles case when fromContact && status === "open"': { raw: {} as any },
  'handles case when num(c.timestamp) || num(last.created_at) ||...': { raw: {} as any },
  'handles case when num(c.timestamp) || num(last.created_at)': { raw: {} as any },
  'handles case when num(c.created_at) || num(c.timestamp) ||...': { raw: {} as any },
  'handles case when num(c.created_at) || num(c.timestamp)': { raw: {} as any },
  'handles case when str(sender.name) || "—"': { raw: {} as any },
  'handles case when str(add.description) || str(add.company_name)': { raw: {} as any },
};

export const toMessageMocks = {
  'handles default case': { raw: {} as any },
  'returns correctly when t === 0 || t === "incoming"': { raw: {} as any },
  'returns fallback when condition is not met': { raw: {} as any },
  'returns correctly when t === 2 || t === "activity"': { raw: {} as any },
  'returns correctly when kind === "outgoing" && !m.sender': { raw: {} as any },
  'handles case when str(x.file_type) || "file"': { raw: {} as any },
  'handles case when condition is not met': { raw: {} as any },
  'handles case when str(x.thumb_url) || url': { raw: {} as any },
  'handles case when url.split("/").pop()?.split("?")[0] || "file"': { raw: {} as any },
  'handles case when str(obj(m.sender).name) || (kind === "outgoing" &&...': { raw: {} as any },
  'handles when url.split("/").pop() is defined': { raw: {} as any },
  'handles when url.split("/").pop() is null/undefined (optional chain short-circuits)': {
    raw: {} as any,
  },
};

export const payloadArrayMocks = {
  'handles default case': { body: {} as any },
  'guards against invalid input (Array.isArray(body))': { body: {} as any },
  'proceeds with valid input': { body: {} as any },
  'guards against invalid input (Array.isArray(b.payload))': { body: {} as any },
  'guards against invalid input (Array.isArray(data.payload))': { body: {} as any },
  'guards against invalid input (Array.isArray(b.data))': { body: {} as any },
};

export const acctMocks = {
  'handles valid path': { path: 'src/utils/helper.ts' },
  'handles empty path': { path: '' },
};

export const toCannedMocks = {
  'handles default case': { raw: {} as any },
};

export const toAgentMocks = {
  'handles default case': { raw: {} as any },
};
