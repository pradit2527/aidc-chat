// Auto-generated mock data for src/lib/adminClient.ts
// @cotester-version: 2
// Do not edit — regenerated on each source change.

import { mockLang } from './../__shared__/types.mock';

export const apiMocks = {
  'handles valid path': {
    path: 'src/utils/helper.ts',
    init: { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any,
  },
  'handles empty path': {
    path: '',
    init: {} as any /* minimal { method?: string; json?: unknown; } */,
  },
  'handles null/undefined (res.ok is falsy)': {
    path: 'src/utils/helper.ts',
    init: { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any,
  },
  'proceeds when value exists': {
    path: '',
    init: {} as any /* minimal { method?: string; json?: unknown; } */,
  },
  'returns correctly when hasBody is truthy': {
    path: 'src/utils/helper.ts',
    init: { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any,
  },
  'returns fallback when hasBody is falsy': {
    path: '',
    init: {} as any /* minimal { method?: string; json?: unknown; } */,
  },
  'uses fallback when init.method is truthy is null/undefined': {
    path: 'src/utils/helper.ts',
    init: { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any,
  },
  'uses init.method is truthy value when defined': {
    path: '',
    init: {} as any /* minimal { method?: string; json?: unknown; } */,
  },
  'handles optional params omitted': { path: 'src/utils/helper.ts', init: undefined },
};

export const fmtTimeMocks = {
  'handles typical value': { sec: 100 },
  'handles negative value': { sec: -50 },
  'handles zero': { sec: 0 },
  'handles boundary value': { sec: Number.MAX_SAFE_INTEGER },
  'handles null/undefined (sec is falsy)': { sec: null },
  'proceeds when value exists': { sec: -50 },
  'returns correctly when sameDay is truthy': { sec: 100 },
  'returns fallback when sameDay is falsy': { sec: -50 },
  'handles case when d.getFullYear() === now.getFullYear() && d.getMonth()...': { sec: 100 },
  'handles case when condition is not met': { sec: -50 },
};

export const labelNameMocks = {
  'handles valid text': {
    title: 'This is a test description for unit testing purposes',
    lang: mockLang(),
  },
  'handles empty text': { title: '', lang: mockLang() },
  'verifies dependency interactions': {
    title: 'This is a test description for unit testing purposes',
    lang: mockLang(),
  },
  'guards against invalid input (title === "cosi-urgent")': {
    title: 'This is a test description for unit testing purposes',
    lang: mockLang(),
  },
  'proceeds with valid input': { title: '', lang: mockLang() },
  'returns correctly when cat is truthy': {
    title: 'This is a test description for unit testing purposes',
    lang: mockLang(),
  },
  'returns fallback when cat is falsy': { title: '', lang: mockLang() },
};

export const initialOfMocks = {
  'handles valid name': { name: 'John Doe' },
  'handles empty name': { name: '' },
  'uses fallback when Array.from(name.trim())[0] is null/undefined': { name: 'John Doe' },
  'uses Array.from(name.trim())[0] value when defined': { name: '' },
};
