// Auto-generated mock data for src/lib/adminApi.ts
// @cotester-version: 2
// Do not edit — regenerated on each source change.

import { mockRequest } from './../__shared__/types.mock';

export const sameOriginMocks = {
  'handles valid request': { req: mockRequest() },
  'handles minimal request': { req: mockRequest() },
  'handles truthy condition': { req: mockRequest() },
  'handles falsy condition': { req: mockRequest() },
  'handles null/undefined (origin is falsy)': { req: mockRequest() },
  'proceeds when value exists': { req: mockRequest() },
  'uses fallback when req.headers.get("x-forwarded-host") is null/undefined': {
    req: mockRequest(),
  },
  'uses req.headers.get("x-forwarded-host") value when defined': { req: mockRequest() },
  'succeeds without throwing': { req: mockRequest() },
  'handles error thrown inside try block': { req: mockRequest() },
};

export const isHttpsMocks = {
  'handles valid request': { req: mockRequest() },
  'handles minimal request': { req: mockRequest() },
  'handles truthy condition': { req: mockRequest() },
  'handles falsy condition': { req: mockRequest() },
};

export const adminRouteMocks = {
  'handles valid request': {
    req: mockRequest(),
    handler: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
      userId: 1,
      expiresAt: new Date('2025-06-15T10:30:00Z'),
    },
    opts: { id: 1, name: 'Test { mutating?: boolean; }' } as any,
  },
  'handles minimal request': {
    req: mockRequest(),
    handler: {} as any /* minimal (s: Session) => Promise */,
    opts: {} as any /* minimal { mutating?: boolean; } */,
  },
  'handles rejection gracefully': {
    req: mockRequest(),
    handler: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
      userId: 1,
      expiresAt: new Date('2025-06-15T10:30:00Z'),
    },
    opts: { id: 1, name: 'Test { mutating?: boolean; }' } as any,
  },
  'verifies dependency interactions': {
    req: mockRequest(),
    handler: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
      userId: 1,
      expiresAt: new Date('2025-06-15T10:30:00Z'),
    },
    opts: { id: 1, name: 'Test { mutating?: boolean; }' } as any,
  },
  'propagates error when dependency fails': {
    req: mockRequest(),
    handler: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
      userId: 1,
      expiresAt: new Date('2025-06-15T10:30:00Z'),
    },
    opts: { id: 1, name: 'Test { mutating?: boolean; }' } as any,
  },
  'guards against invalid input (opts.mutating && !sameOrigin(req))': {
    req: mockRequest(),
    handler: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
      userId: 1,
      expiresAt: new Date('2025-06-15T10:30:00Z'),
    },
    opts: { id: 1, name: 'Test { mutating?: boolean; }' } as any,
  },
  'proceeds with valid input': {
    req: mockRequest(),
    handler: {} as any /* minimal (s: Session) => Promise */,
    opts: {} as any /* minimal { mutating?: boolean; } */,
  },
  'handles null/undefined (session is falsy)': {
    req: mockRequest(),
    handler: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
      userId: 1,
      expiresAt: new Date('2025-06-15T10:30:00Z'),
    },
    opts: { id: 1, name: 'Test { mutating?: boolean; }' } as any,
  },
  'proceeds when value exists': {
    req: mockRequest(),
    handler: {} as any /* minimal (s: Session) => Promise */,
    opts: {} as any /* minimal { mutating?: boolean; } */,
  },
  'handles when e instanceof CwError && e.status === 401': {
    req: mockRequest(),
    handler: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
      userId: 1,
      expiresAt: new Date('2025-06-15T10:30:00Z'),
    },
    opts: { id: 1, name: 'Test { mutating?: boolean; }' } as any,
  },
  'handles when condition is not met': {
    req: mockRequest(),
    handler: {} as any /* minimal (s: Session) => Promise */,
    opts: {} as any /* minimal { mutating?: boolean; } */,
  },
  'returns correctly when e instanceof CwError && e.status >= 400 && e.status < 500': {
    req: mockRequest(),
    handler: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
      userId: 1,
      expiresAt: new Date('2025-06-15T10:30:00Z'),
    },
    opts: { id: 1, name: 'Test { mutating?: boolean; }' } as any,
  },
  'returns fallback when condition is not met': {
    req: mockRequest(),
    handler: {} as any /* minimal (s: Session) => Promise */,
    opts: {} as any /* minimal { mutating?: boolean; } */,
  },
  'returns correctly when e instanceof CwError': {
    req: mockRequest(),
    handler: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
      userId: 1,
      expiresAt: new Date('2025-06-15T10:30:00Z'),
    },
    opts: { id: 1, name: 'Test { mutating?: boolean; }' } as any,
  },
  'returns correctly when e instanceof Error': {
    req: mockRequest(),
    handler: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
      userId: 1,
      expiresAt: new Date('2025-06-15T10:30:00Z'),
    },
    opts: { id: 1, name: 'Test { mutating?: boolean; }' } as any,
  },
  'handles case when e instanceof CwError && e.status >= 400': {
    req: mockRequest(),
    handler: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
      userId: 1,
      expiresAt: new Date('2025-06-15T10:30:00Z'),
    },
    opts: { id: 1, name: 'Test { mutating?: boolean; }' } as any,
  },
  'handles case when condition is not met': {
    req: mockRequest(),
    handler: {} as any /* minimal (s: Session) => Promise */,
    opts: {} as any /* minimal { mutating?: boolean; } */,
  },
  'succeeds without throwing': {
    req: mockRequest(),
    handler: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
      userId: 1,
      expiresAt: new Date('2025-06-15T10:30:00Z'),
    },
    opts: { id: 1, name: 'Test { mutating?: boolean; }' } as any,
  },
  'handles error thrown inside try block': {
    req: mockRequest(),
    handler: {} as any /* minimal (s: Session) => Promise */,
    opts: {} as any /* minimal { mutating?: boolean; } */,
  },
  'handles optional params omitted': {
    req: mockRequest(),
    handler: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
      userId: 1,
      expiresAt: new Date('2025-06-15T10:30:00Z'),
    },
    opts: undefined,
  },
};

export const loginAllowedMocks = {
  'handles valid host': { ip: '192.168.1.100' },
  'handles localhost': { ip: '127.0.0.1' },
  'handles truthy condition': { ip: '192.168.1.100' },
  'handles falsy condition': { ip: '192.168.1.100' },
  'handles when !a || a.reset < now': { ip: '192.168.1.100' },
  'handles when condition is not met': { ip: '127.0.0.1' },
};

export const parseIdMocks = {
  'handles valid input': { v: 'test-string-value' },
  'handles empty string': { v: '' },
  'handles special characters': { v: "O'Brien & Sons <LLC>" },
  'handles whitespace-only input': { v: '   ' },
  'returns correctly when /^\\d{1,12}$/.test(v)': { v: 'test-string-value' },
  'returns fallback when condition is not met': { v: '' },
};
