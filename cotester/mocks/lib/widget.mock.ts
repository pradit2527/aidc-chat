// Auto-generated mock data for src/lib/widget.ts
// @cotester-version: 2
// Do not edit — regenerated on each source change.

import { mockChatMeta, mockChatwootSdk, mockLang, mockProfile } from './../__shared__/types.mock';

export const loadChatwootMocks = {
  'handles valid { baseurl: string; websitetoken: string; lang: lang; }': {
    opts: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
      userId: 1,
      expiresAt: new Date('2025-06-15T10:30:00Z'),
    },
  },
  'handles minimal { baseurl: string; websitetoken: string; lang: lang; }': {
    opts: {} as any /* minimal { baseUrl: string; websiteToken: string; lang: Lang; } */,
  },
  'rejects on invalid input': {
    opts: {} as any /* minimal { baseUrl: string; websiteToken: string; lang: Lang; } */,
  },
  'guards against invalid input (sdkPromise is truthy)': {
    opts: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
      userId: 1,
      expiresAt: new Date('2025-06-15T10:30:00Z'),
    },
  },
  'proceeds with valid input': {
    opts: {} as any /* minimal { baseUrl: string; websiteToken: string; lang: Lang; } */,
  },
  'handles when pendingMeta is truthy': {
    opts: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
      userId: 1,
      expiresAt: new Date('2025-06-15T10:30:00Z'),
    },
  },
  'handles when pendingMeta is falsy': {
    opts: {} as any /* minimal { baseUrl: string; websiteToken: string; lang: Lang; } */,
  },
  'returns correctly when window.$chatwoot': {
    opts: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
      userId: 1,
      expiresAt: new Date('2025-06-15T10:30:00Z'),
    },
  },
  'returns fallback when condition is not met': {
    opts: {} as any /* minimal { baseUrl: string; websiteToken: string; lang: Lang; } */,
  },
  'handles when window.chatwootSDK is truthy is defined': {
    opts: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
      userId: 1,
      expiresAt: new Date('2025-06-15T10:30:00Z'),
    },
  },
  'handles when window.chatwootSDK is truthy is null/undefined (optional chain short-circuits)': {
    opts: {} as any /* minimal { baseUrl: string; websiteToken: string; lang: Lang; } */,
  },
};

export const identifyMocks = {
  'handles valid chatwootsdk': { cw: mockChatwootSdk(), p: mockProfile() },
  'handles minimal chatwootsdk': { cw: mockChatwootSdk(), p: mockProfile() },
  'returns correctly when p.identifierHash is truthy': { cw: mockChatwootSdk(), p: mockProfile() },
  'returns fallback when p.identifierHash is falsy': { cw: mockChatwootSdk(), p: mockProfile() },
};

export const setChatMetaMocks = {
  'handles valid chatmeta': { meta: mockChatMeta() },
  'handles minimal chatmeta': { meta: mockChatMeta() },
};

export const setWidgetLocaleMocks = {
  'handles english locale': { lang: mockLang() },
  'handles spanish locale': { lang: mockLang() },
  'handles when window.$chatwoot is defined': { lang: mockLang() },
  'handles when window.$chatwoot is null/undefined (optional chain short-circuits)': {
    lang: mockLang(),
  },
};

export const resetChatwootMocks = {
  'handles default case': {},
  'handles when window.$chatwoot is defined': {},
  'handles when window.$chatwoot is null/undefined (optional chain short-circuits)': {},
};
