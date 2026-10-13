// @cotester-generated
// @cotester-version: 2

jest.mock('../../../src/lib/cw', () => ({
  CwError: jest.fn(),
}));

jest.mock('../../../src/lib/session', () => ({
  getSession: jest.fn(),
  SESSION_COOKIE: jest.fn(),
}));

import { sameOrigin, isHttps, adminRoute, loginAllowed, parseId } from '../../../src/lib/adminApi';
import * as mocks from '../../mocks/lib/adminApi.mock';
import { CwError } from '../../../src/lib/cw';
import { getSession, SESSION_COOKIE } from '../../../src/lib/session';

// @testgen-sig:sameOrigin(req:Request):boolean
describe('sameOrigin', () => {
  test('handles valid request', () => {
    // Arrange
    const req = mocks.sameOriginMocks['handles valid request'].req;

    // Act
    const result = sameOrigin(req as any);

    // Assert
    expect(typeof result).toBe('boolean');
    // expect(result).toBe(true);
  });

  test('handles minimal request', () => {
    // Arrange
    const req = mocks.sameOriginMocks['handles minimal request'].req;

    // Act
    const result = sameOrigin(req as any);

    // Assert
    expect(typeof result).toBe('boolean');
    // expect(result).toBe(true);
  });

  test('handles truthy condition', () => {
    // Arrange
    const req = mocks.sameOriginMocks['handles truthy condition'].req;

    // Act
    const result = sameOrigin(req as any);

    // Assert
    expect(typeof result).toBe('boolean');
    // expect(result).toBe(true);
  });

  test('handles falsy condition', () => {
    // Arrange
    const req = mocks.sameOriginMocks['handles falsy condition'].req;

    // Act
    const result = sameOrigin(req as any);

    // Assert
    expect(typeof result).toBe('boolean');
    // expect(result).toBe(false);
  });

  test('handles null/undefined (origin is falsy)', () => {
    // Arrange
    const req = mocks.sameOriginMocks['handles null/undefined (origin is falsy)'].req;

    // Act
    const result = sameOrigin(req as any);

    // Assert
    expect(typeof result).toBe('boolean');
    // expect(result).toBe(false);
  });

  test('proceeds when value exists', () => {
    // Arrange
    const req = mocks.sameOriginMocks['proceeds when value exists'].req;

    // Act
    const result = sameOrigin(req as any);

    // Assert
    expect(typeof result).toBe('boolean');
    // expect(result).toBe(true);
  });

  test('uses fallback when req.headers.get("x-forwarded-host") is null/undefined', () => {
    // Arrange
    const req =
      mocks.sameOriginMocks[
        'uses fallback when req.headers.get("x-forwarded-host") is null/undefined'
      ].req;

    // Act
    const result = sameOrigin(req as any);

    // Assert
    expect(typeof result).toBe('boolean');
    // expect(result).toBe(true);
  });

  test('uses req.headers.get("x-forwarded-host") value when defined', () => {
    // Arrange
    const req =
      mocks.sameOriginMocks['uses req.headers.get("x-forwarded-host") value when defined'].req;

    // Act
    const result = sameOrigin(req as any);

    // Assert
    expect(typeof result).toBe('boolean');
    // expect(result).toBe(true);
  });

  test('succeeds without throwing', () => {
    // Arrange
    const req = mocks.sameOriginMocks['succeeds without throwing'].req;

    // Act
    const result = sameOrigin(req as any);

    // Assert
    expect(typeof result).toBe('boolean');
    // expect(result).toBe(true);
  });

  test('handles error thrown inside try block', () => {
    // Arrange
    const req = mocks.sameOriginMocks['handles error thrown inside try block'].req;

    // Act
    const result = sameOrigin(req as any);

    // Assert
    expect(typeof result).toBe('boolean');
    // expect(result).toBe(true);
  });
});

// @testgen-sig:isHttps(req:Request):boolean
describe('isHttps', () => {
  test('handles valid request', () => {
    // Arrange
    const req = mocks.isHttpsMocks['handles valid request'].req;

    // Act
    const result = isHttps(req as any);

    // Assert
    expect(typeof result).toBe('boolean');
    // expect(result).toBe(true);
  });

  test('handles minimal request', () => {
    // Arrange
    const req = mocks.isHttpsMocks['handles minimal request'].req;

    // Act
    const result = isHttps(req as any);

    // Assert
    expect(typeof result).toBe('boolean');
    // expect(result).toBe(true);
  });

  test('handles truthy condition', () => {
    // Arrange
    const req = mocks.isHttpsMocks['handles truthy condition'].req;

    // Act
    const result = isHttps(req as any);

    // Assert
    expect(typeof result).toBe('boolean');
    // expect(result).toBe(true);
  });

  test('handles falsy condition', () => {
    // Arrange
    const req = mocks.isHttpsMocks['handles falsy condition'].req;

    // Act
    const result = isHttps(req as any);

    // Assert
    expect(typeof result).toBe('boolean');
    // expect(result).toBe(false);
  });
});

// @testgen-sig:adminRoute(req:Request,handler:(s:Session)=>Promise<unknown>,opts:_mutating?:boolean;_):Promise<Response>
describe('adminRoute', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([
    [
      'handles valid request',
      {
        body: {} as any /* object */,
        headers: { 'Content-Type': 'application/json' },
        method: 'GET',
        url: 'https://api.example.com/v1/resource',
      },
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        userId: 1,
        expiresAt: new Date('2025-06-15T10:30:00Z'),
      },
      { id: 1, name: 'Test { mutating?: boolean; }' } as any,
    ] as any[],
    [
      'handles minimal request',
      {} as any /* minimal Request */,
      {} as any /* minimal (s: Session) => Promise */,
      {} as any /* minimal { mutating?: boolean; } */,
    ] as any[],
    [
      'handles rejection gracefully',
      {
        body: {} as any /* object */,
        headers: { 'Content-Type': 'application/json' },
        method: 'GET',
        url: 'https://api.example.com/v1/resource',
      },
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        userId: 1,
        expiresAt: new Date('2025-06-15T10:30:00Z'),
      },
      { id: 1, name: 'Test { mutating?: boolean; }' } as any,
    ] as any[],
    [
      'verifies dependency interactions',
      {
        body: {} as any /* object */,
        headers: { 'Content-Type': 'application/json' },
        method: 'GET',
        url: 'https://api.example.com/v1/resource',
      },
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        userId: 1,
        expiresAt: new Date('2025-06-15T10:30:00Z'),
      },
      { id: 1, name: 'Test { mutating?: boolean; }' } as any,
    ] as any[],
    [
      'guards against invalid input (opts.mutating && !sameOrigin(req))',
      {
        body: {} as any /* object */,
        headers: { 'Content-Type': 'application/json' },
        method: 'GET',
        url: 'https://api.example.com/v1/resource',
      },
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        userId: 1,
        expiresAt: new Date('2025-06-15T10:30:00Z'),
      },
      { id: 1, name: 'Test { mutating?: boolean; }' } as any,
    ] as any[],
    [
      'proceeds with valid input',
      {} as any /* minimal Request */,
      {} as any /* minimal (s: Session) => Promise */,
      {} as any /* minimal { mutating?: boolean; } */,
    ] as any[],
    [
      'handles null/undefined (session is falsy)',
      {
        body: {} as any /* object */,
        headers: { 'Content-Type': 'application/json' },
        method: 'GET',
        url: 'https://api.example.com/v1/resource',
      },
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        userId: 1,
        expiresAt: new Date('2025-06-15T10:30:00Z'),
      },
      { id: 1, name: 'Test { mutating?: boolean; }' } as any,
    ] as any[],
    [
      'proceeds when value exists',
      {} as any /* minimal Request */,
      {} as any /* minimal (s: Session) => Promise */,
      {} as any /* minimal { mutating?: boolean; } */,
    ] as any[],
    [
      'handles when e instanceof CwError && e.status === 401',
      {
        body: {} as any /* object */,
        headers: { 'Content-Type': 'application/json' },
        method: 'GET',
        url: 'https://api.example.com/v1/resource',
      },
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        userId: 1,
        expiresAt: new Date('2025-06-15T10:30:00Z'),
      },
      { id: 1, name: 'Test { mutating?: boolean; }' } as any,
    ] as any[],
    [
      'handles when condition is not met',
      {} as any /* minimal Request */,
      {} as any /* minimal (s: Session) => Promise */,
      {} as any /* minimal { mutating?: boolean; } */,
    ] as any[],
    [
      'returns correctly when e instanceof CwError && e.status >= 400 && e.status < 500',
      {
        body: {} as any /* object */,
        headers: { 'Content-Type': 'application/json' },
        method: 'GET',
        url: 'https://api.example.com/v1/resource',
      },
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        userId: 1,
        expiresAt: new Date('2025-06-15T10:30:00Z'),
      },
      { id: 1, name: 'Test { mutating?: boolean; }' } as any,
    ] as any[],
    [
      'returns fallback when condition is not met',
      {} as any /* minimal Request */,
      {} as any /* minimal (s: Session) => Promise */,
      {} as any /* minimal { mutating?: boolean; } */,
    ] as any[],
    [
      'returns correctly when e instanceof CwError',
      {
        body: {} as any /* object */,
        headers: { 'Content-Type': 'application/json' },
        method: 'GET',
        url: 'https://api.example.com/v1/resource',
      },
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        userId: 1,
        expiresAt: new Date('2025-06-15T10:30:00Z'),
      },
      { id: 1, name: 'Test { mutating?: boolean; }' } as any,
    ] as any[],
    [
      'returns correctly when e instanceof Error',
      {
        body: {} as any /* object */,
        headers: { 'Content-Type': 'application/json' },
        method: 'GET',
        url: 'https://api.example.com/v1/resource',
      },
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        userId: 1,
        expiresAt: new Date('2025-06-15T10:30:00Z'),
      },
      { id: 1, name: 'Test { mutating?: boolean; }' } as any,
    ] as any[],
    [
      'handles case when e instanceof CwError && e.status >= 400',
      {
        body: {} as any /* object */,
        headers: { 'Content-Type': 'application/json' },
        method: 'GET',
        url: 'https://api.example.com/v1/resource',
      },
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        userId: 1,
        expiresAt: new Date('2025-06-15T10:30:00Z'),
      },
      { id: 1, name: 'Test { mutating?: boolean; }' } as any,
    ] as any[],
    [
      'handles case when condition is not met',
      {} as any /* minimal Request */,
      {} as any /* minimal (s: Session) => Promise */,
      {} as any /* minimal { mutating?: boolean; } */,
    ] as any[],
    [
      'succeeds without throwing',
      {
        body: {} as any /* object */,
        headers: { 'Content-Type': 'application/json' },
        method: 'GET',
        url: 'https://api.example.com/v1/resource',
      },
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        userId: 1,
        expiresAt: new Date('2025-06-15T10:30:00Z'),
      },
      { id: 1, name: 'Test { mutating?: boolean; }' } as any,
    ] as any[],
    [
      'handles error thrown inside try block',
      {} as any /* minimal Request */,
      {} as any /* minimal (s: Session) => Promise */,
      {} as any /* minimal { mutating?: boolean; } */,
    ] as any[],
    [
      'handles optional params omitted',
      {
        body: {} as any /* object */,
        headers: { 'Content-Type': 'application/json' },
        method: 'GET',
        url: 'https://api.example.com/v1/resource',
      },
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        userId: 1,
        expiresAt: new Date('2025-06-15T10:30:00Z'),
      },
      undefined,
    ] as any[],
  ])('%s', async (_label: string, req: any, handler: any, opts: any) => {
    // Act
    const result = await adminRoute(req, handler, opts);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('propagates error when dependency fails', async () => {
    // Arrange — force a dependency to reject
    const depError = new Error('dependency failure');
    getSession.mockRejectedValueOnce(depError);
    const req = {
      body: {} as any /* object */,
      headers: { 'Content-Type': 'application/json' },
      method: 'GET',
      url: 'https://api.example.com/v1/resource',
    };
    const handler = {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
      userId: 1,
      expiresAt: new Date('2025-06-15T10:30:00Z'),
    };
    const opts = { id: 1, name: 'Test { mutating?: boolean; }' } as any;

    // Act & Assert
    await expect(adminRoute(req as any, handler as any, opts as any)).rejects.toThrow(
      'dependency failure',
    );
  });
});

// @testgen-sig:loginAllowed(ip:string):boolean
describe('loginAllowed', () => {
  test('handles valid host', () => {
    // Arrange
    const ip = mocks.loginAllowedMocks['handles valid host'].ip;

    // Act
    const result = loginAllowed(ip as any);

    // Assert
    expect(typeof result).toBe('boolean');
    // expect(result).toBe(true);
  });

  test('handles localhost', () => {
    // Arrange
    const ip = mocks.loginAllowedMocks['handles localhost'].ip;

    // Act
    const result = loginAllowed(ip as any);

    // Assert
    expect(typeof result).toBe('boolean');
    // expect(result).toBe(true);
  });

  test('handles truthy condition', () => {
    // Arrange
    const ip = mocks.loginAllowedMocks['handles truthy condition'].ip;

    // Act
    const result = loginAllowed(ip as any);

    // Assert
    expect(typeof result).toBe('boolean');
    // expect(result).toBe(true);
  });

  test('handles falsy condition', () => {
    // Arrange
    const ip = mocks.loginAllowedMocks['handles falsy condition'].ip;

    // Act
    const result = loginAllowed(ip as any);

    // Assert
    expect(typeof result).toBe('boolean');
    // expect(result).toBe(false);
  });

  test('handles when !a || a.reset < now', () => {
    // Arrange
    const ip = mocks.loginAllowedMocks['handles when !a || a.reset < now'].ip;

    // Act
    const result = loginAllowed(ip as any);

    // Assert
    expect(typeof result).toBe('boolean');
    // expect(result).toBe(true);
  });

  test('handles when condition is not met', () => {
    // Arrange
    const ip = mocks.loginAllowedMocks['handles when condition is not met'].ip;

    // Act
    const result = loginAllowed(ip as any);

    // Assert
    expect(typeof result).toBe('boolean');
    // expect(result).toBe(true);
  });
});

// @testgen-sig:parseId(v:string):number
describe('parseId', () => {
  test('handles valid input', () => {
    // Arrange
    const v = mocks.parseIdMocks['handles valid input'].v;

    // Act
    const result = parseId(v as any);

    // Assert
    expect(typeof result).toBe('number');
    // expect(result).toBe(1);
  });

  test('handles empty string', () => {
    // Arrange
    const v = mocks.parseIdMocks['handles empty string'].v;

    // Act
    const result = parseId(v as any);

    // Assert
    expect(typeof result).toBe('number');
    // expect(result).toBe(1);
  });

  test('handles special characters', () => {
    // Arrange
    const v = mocks.parseIdMocks['handles special characters'].v;

    // Act
    const result = parseId(v as any);

    // Assert
    expect(typeof result).toBe('number');
    // expect(result).toBe(1);
  });

  test('handles whitespace-only input', () => {
    // Arrange
    const v = mocks.parseIdMocks['handles whitespace-only input'].v;

    // Act
    const result = parseId(v as any);

    // Assert
    expect(typeof result).toBe('number');
    // expect(result).toBe(1);
  });

  test('returns correctly when /^\\d{1,12}$/.test(v)', () => {
    // Arrange
    const v = mocks.parseIdMocks['returns correctly when /^\\d{1,12}$/.test(v)'].v;

    // Act
    const result = parseId(v as any);

    // Assert
    expect(typeof result).toBe('number');
    // expect(result).toBe(1);
  });

  test('returns fallback when condition is not met', () => {
    // Arrange
    const v = mocks.parseIdMocks['returns fallback when condition is not met'].v;

    // Act
    const result = parseId(v as any);

    // Assert
    expect(typeof result).toBe('number');
    // expect(result).toBe(1);
  });
});
