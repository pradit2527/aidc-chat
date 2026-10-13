// Auto-generated mock data for src/lib/profileStore.ts
// @cotester-version: 2
// Do not edit — regenerated on each source change.

import { mockProfile } from './../__shared__/types.mock';

export const getProfileMocks = {
  'handles default case': {},
  'guards against invalid input (raw === cachedRaw)': {},
  'proceeds with valid input': {},
  'returns correctly when raw is truthy': {},
  'returns fallback when raw is falsy': {},
  'succeeds without throwing': {},
  'handles error thrown inside try block': {},
};

export const saveProfileMocks = {
  'handles valid profile': { p: mockProfile() },
  'handles minimal profile': { p: mockProfile() },
  'handles when p is truthy': { p: mockProfile() },
  'handles when p is falsy': { p: mockProfile() },
  'succeeds without throwing': { p: mockProfile() },
  'handles error thrown inside try block': { p: mockProfile() },
};

export const subscribeProfileMocks = {
  'handles valid () => void': { cb: { id: 1, name: 'Test () => void' } as any },
  'handles minimal () => void': { cb: {} as any /* minimal () => void */ },
};
