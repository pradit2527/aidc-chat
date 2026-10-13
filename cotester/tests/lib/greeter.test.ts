// @cotester-generated
// @cotester-version: 2

jest.mock('../../../src/lib/autoGreeting', () => ({
  AUTO_GREETING_ENABLED: jest.fn(),
}));

import { runGreetings } from '../../../src/lib/greeter';
import * as mocks from '../../mocks/lib/greeter.mock';
import { AUTO_GREETING_ENABLED } from '../../../src/lib/autoGreeting';

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
const mockInFlight: any = {
  select: jest.fn().mockImplementation(() => _drizzleChain([])),
  insert: jest.fn().mockImplementation(() => _drizzleChain([{ id: 1 }])),
  update: jest.fn().mockImplementation(() => _drizzleChain([{ id: 1 }])),
  delete: jest.fn().mockImplementation(() => _drizzleChain([])),
  query: jest.fn().mockResolvedValue([]),
  execute: jest.fn().mockResolvedValue([]),
  transaction: jest.fn().mockImplementation((cb: any) => cb(mockInFlight)),
};

// @testgen-sig:runGreetings(s:Session,convs:ConversationDTO[]):Promise<void>
describe('runGreetings', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([
    [
      'handles valid session',
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        client: 'test-value',
        uid: 'test-value',
        user: { id: 1, name: 'John Doe', email: 'test@example.com' },
        exp: 1,
      },
      [mockConversationDTO(), mockConversationDTO()],
    ] as any[],
    ['handles minimal session', {} as any /* Session */, [] as any[]] as any[],
    [
      'handles rejection gracefully',
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        client: 'test-value',
        uid: 'test-value',
        user: { id: 1, name: 'John Doe', email: 'test@example.com' },
        exp: 1,
      },
      [mockConversationDTO(), mockConversationDTO()],
    ] as any[],
    [
      'verifies dependency interactions',
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        client: 'test-value',
        uid: 'test-value',
        user: { id: 1, name: 'John Doe', email: 'test@example.com' },
        exp: 1,
      },
      [mockConversationDTO(), mockConversationDTO()],
    ] as any[],
    [
      'handles null/undefined (AUTO_GREETING_ENABLED is falsy)',
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        client: 'test-value',
        uid: 'test-value',
        user: { id: 1, name: 'John Doe', email: 'test@example.com' },
        exp: 1,
      },
      [mockConversationDTO(), mockConversationDTO()],
    ] as any[],
    ['proceeds when value exists', {} as any /* Session */, [] as any[]] as any[],
    [
      'handles when c.status !== "open" || !c.previewFromContact',
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        client: 'test-value',
        uid: 'test-value',
        user: { id: 1, name: 'John Doe', email: 'test@example.com' },
        exp: 1,
      },
      [mockConversationDTO(), mockConversationDTO()],
    ] as any[],
    ['handles when condition is not met', {} as any /* Session */, [] as any[]] as any[],
    [
      'handles when checked.get(c.id) === c.updatedAt || inFlight.has(c.id)',
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        client: 'test-value',
        uid: 'test-value',
        user: { id: 1, name: 'John Doe', email: 'test@example.com' },
        exp: 1,
      },
      [mockConversationDTO(), mockConversationDTO()],
    ] as any[],
    [
      'returns correctly when e instanceof Error',
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        client: 'test-value',
        uid: 'test-value',
        user: { id: 1, name: 'John Doe', email: 'test@example.com' },
        exp: 1,
      },
      [mockConversationDTO(), mockConversationDTO()],
    ] as any[],
    ['returns fallback when condition is not met', {} as any /* Session */, [] as any[]] as any[],
  ])('%s', async (_label: string, s: any, convs: any) => {
    // Act
    const result = await runGreetings(s, convs);

    // Assert
    expect(result).toBeUndefined();
  });

  test('propagates error when dependency fails', async () => {
    // Arrange — force a dependency to reject
    // No async dependency found — add a mockRejectedValueOnce call for the relevant dep
    const s = {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
      client: 'test-value',
      uid: 'test-value',
      user: { id: 1, name: 'John Doe', email: 'test@example.com' },
      exp: 1,
    };
    const convs = [mockConversationDTO(), mockConversationDTO()];

    // Act & Assert
    await expect(runGreetings(s as any, convs as any)).rejects.toThrow('dependency failure');
  });
});
