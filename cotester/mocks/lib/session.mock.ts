// Auto-generated mock data for src/lib/session.ts
// @cotester-version: 2
// Do not edit — regenerated on each source change.

import { mockSession } from './../__shared__/types.mock';

export const sealSessionMocks = {
  'handles valid session': { s: mockSession() },
  'handles minimal session': { s: mockSession() },
};

export const unsealSessionMocks = {
  'handles valid input': { value: 'test-string-value' },
  'handles empty string': { value: '' },
  'handles special characters': { value: "O'Brien & Sons <LLC>" },
  'handles whitespace-only input': { value: '   ' },
  'handles null/undefined (value is falsy)': { value: null },
  'proceeds when value exists': { value: '' },
  'returns correctly when s.exp > Date.now()': { value: 'test-string-value' },
  'returns fallback when condition is not met': { value: '' },
  'succeeds without throwing': { value: 'test-string-value' },
  'handles error thrown inside try block': { value: '' },
};

export const getSessionMocks = {
  'handles default case': {},
  'handles rejection gracefully': {},
  'handles when (await cookies()).get(SESSION_COOKIE) is defined': {},
  'handles when (await cookies()).get(SESSION_COOKIE) is null/undefined (optional chain short-circuits)':
    {},
};
