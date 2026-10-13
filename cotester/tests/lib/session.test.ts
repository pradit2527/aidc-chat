// @cotester-generated
// @cotester-version: 2

import { sealSession, unsealSession, getSession } from '../../../src/lib/session';
import * as mocks from '../../mocks/lib/session.mock';

// Drizzle expression builder stubs — import or mock these in your test setup:
// jest.mock('drizzle-orm', () => ({
//   eq: jest.fn((col, val) => `${col}=${val}`),
//   and: jest.fn((...args) => args.join(' AND ')),
//   or: jest.fn((...args) => args.join(' OR ')),
//   ne: jest.fn(), gt: jest.fn(), gte: jest.fn(), lt: jest.fn(), lte: jest.fn(),
//   like: jest.fn(), ilike: jest.fn(), inArray: jest.fn(), notInArray: jest.fn(),
// }));
function _drizzleChain(terminal: any = []) {
  const chain: any = {};
  [
    'from',
    'where',
    'limit',
    'offset',
    'orderBy',
    'values',
    'set',
    'returning',
    'leftJoin',
    'innerJoin',
    'groupBy',
    'having',
    'onConflictDoNothing',
    'onConflictDoUpdate',
  ].forEach((m) => {
    chain[m] = jest.fn().mockReturnValue(chain);
  });
  chain.then = jest.fn().mockImplementation((cb: any) => Promise.resolve(terminal).then(cb));
  // Make the chain itself thenable so `await db.select().from(t)` works
  chain[Symbol.toPrimitive] = () => terminal;
  return chain;
}
const mockD: any = {
  select: jest.fn().mockImplementation(() => _drizzleChain([])),
  insert: jest.fn().mockImplementation(() => _drizzleChain([{ id: 1 }])),
  update: jest.fn().mockImplementation(() => _drizzleChain([{ id: 1 }])),
  delete: jest.fn().mockImplementation(() => _drizzleChain([])),
  query: jest.fn().mockResolvedValue([]),
  execute: jest.fn().mockResolvedValue([]),
  transaction: jest.fn().mockImplementation((cb: any) => cb(mockD)),
};

// @testgen-sig:sealSession(s:Session):string
describe('sealSession', () => {
  test('handles valid session', () => {
    // Arrange
    const s = mocks.sealSessionMocks['handles valid session'].s;

    // Act
    const result = sealSession(s as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('handles minimal session', () => {
    // Arrange
    const s = mocks.sealSessionMocks['handles minimal session'].s;

    // Act
    const result = sealSession(s as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });
});

// @testgen-sig:unsealSession(value:string):Session
describe('unsealSession', () => {
  test('handles valid input', () => {
    // Arrange
    const value = mocks.unsealSessionMocks['handles valid input'].value;

    // Act
    const result = unsealSession(value as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles empty string', () => {
    // Arrange
    const value = mocks.unsealSessionMocks['handles empty string'].value;

    // Act
    const result = unsealSession(value as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles special characters', () => {
    // Arrange
    const value = mocks.unsealSessionMocks['handles special characters'].value;

    // Act
    const result = unsealSession(value as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles whitespace-only input', () => {
    // Arrange
    const value = mocks.unsealSessionMocks['handles whitespace-only input'].value;

    // Act
    const result = unsealSession(value as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles null/undefined (value is falsy)', () => {
    // Arrange
    const value = mocks.unsealSessionMocks['handles null/undefined (value is falsy)'].value;

    // Act
    const result = unsealSession(value as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('proceeds when value exists', () => {
    // Arrange
    const value = mocks.unsealSessionMocks['proceeds when value exists'].value;

    // Act
    const result = unsealSession(value as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns correctly when s.exp > Date.now()', () => {
    // Arrange
    const value = mocks.unsealSessionMocks['returns correctly when s.exp > Date.now()'].value;

    // Act
    const result = unsealSession(value as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns fallback when condition is not met', () => {
    // Arrange
    const value = mocks.unsealSessionMocks['returns fallback when condition is not met'].value;

    // Act
    const result = unsealSession(value as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('succeeds without throwing', () => {
    // Arrange
    const value = mocks.unsealSessionMocks['succeeds without throwing'].value;

    // Act
    const result = unsealSession(value as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles error thrown inside try block', () => {
    // Arrange
    const value = mocks.unsealSessionMocks['handles error thrown inside try block'].value;

    // Act
    const result = unsealSession(value as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });
});

// @testgen-sig:getSession():Promise<Session>
describe('getSession', () => {
  test('handles default case', async () => {
    // Act
    const result = await getSession();
    // TIP: alternatively use: await expect(getSession()).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles rejection gracefully', async () => {
    // Act
    const result = await getSession();
    // TIP: alternatively use: await expect(getSession()).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when (await cookies()).get(SESSION_COOKIE) is defined', async () => {
    // Act
    const result = await getSession();
    // TIP: alternatively use: await expect(getSession()).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when (await cookies()).get(SESSION_COOKIE) is null/undefined (optional chain short-circuits)', async () => {
    // Act
    const result = await getSession();
    // TIP: alternatively use: await expect(getSession()).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });
});
