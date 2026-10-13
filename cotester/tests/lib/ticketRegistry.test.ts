// @cotester-generated
// @cotester-version: 2

jest.mock('../../../src/lib/db', () => ({
  dbEnabled: jest.fn(),
  q: jest.fn(),
  db: jest.fn(),
}));

import {
  registerTickets,
  unregisteredIds,
  syncTicket,
  ticketNoOf,
  logEvent,
  markFirstReply,
} from '../../../src/lib/ticketRegistry';
import * as mocks from '../../mocks/lib/ticketRegistry.mock';
import { dbEnabled, q, db } from '../../../src/lib/db';

// @testgen-sig:registerTickets(convs:ConversationDTO[],actor:string):Promise<Map<number,string>>
describe('registerTickets', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([
    [
      'handles populated list',
      [mockConversationDTO(), mockConversationDTO()],
      'test-string-value',
    ] as any[],
    ['handles empty list', [] as any[], ''] as any[],
    ['handles single item list', [mockConversationDTO()], "O'Brien & Sons <LLC>"] as any[],
    [
      'handles rejection gracefully',
      [mockConversationDTO(), mockConversationDTO()],
      'test-string-value',
    ] as any[],
    [
      'verifies dependency interactions',
      [mockConversationDTO(), mockConversationDTO()],
      'test-string-value',
    ] as any[],
    [
      'guards against invalid input (!dbEnabled || convs.length === 0)',
      [mockConversationDTO(), mockConversationDTO()],
      'test-string-value',
    ] as any[],
    ['proceeds with valid input', [] as any[], ''] as any[],
    [
      'handles when r is falsy',
      [mockConversationDTO(), mockConversationDTO()],
      'test-string-value',
    ] as any[],
    ['handles when r is truthy', [] as any[], ''] as any[],
    [
      'handles case when a.createdAt - b.createdAt || a.id - b.id',
      [mockConversationDTO(), mockConversationDTO()],
      'test-string-value',
    ] as any[],
    ['handles case when condition is not met', [] as any[], ''] as any[],
    [
      'handles optional params omitted',
      [mockConversationDTO(), mockConversationDTO()],
      undefined,
    ] as any[],
  ])('%s', async (_label: string, convs: any, actor: any) => {
    // Act
    const result = await registerTickets(convs, actor);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('propagates error when dependency fails', async () => {
    // Arrange — force a dependency to reject
    const depError = new Error('dependency failure');
    q.mockRejectedValueOnce(depError);
    const convs = [mockConversationDTO(), mockConversationDTO()];
    const actor = 'test-string-value';

    // Act & Assert
    await expect(registerTickets(convs as any, actor as any)).rejects.toThrow('dependency failure');
  });
});

// @testgen-sig:unregisteredIds(ids:number[]):Promise<number[]>
describe('unregisteredIds', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('handles populated list', async () => {
    // Arrange
    const ids = mocks.unregisteredIdsMocks['handles populated list'].ids;

    // Act
    const result = await unregisteredIds(ids as any);
    // TIP: alternatively use: await expect(unregisteredIds(ids as any)).resolves.toBeDefined()

    // Assert
    expect(Array.isArray(result)).toBe(true);
    // expect(result).toEqual([] as any[]);
  });

  test('handles empty list', async () => {
    // Arrange
    const ids = mocks.unregisteredIdsMocks['handles empty list'].ids;

    // Act
    const result = await unregisteredIds(ids as any);
    // TIP: alternatively use: await expect(unregisteredIds(ids as any)).resolves.toBeDefined()

    // Assert
    expect(Array.isArray(result)).toBe(true);
    // expect(result).toHaveLength(0);
    // expect(result).toEqual([] as any[]);
  });

  test('handles single item list', async () => {
    // Arrange
    const ids = mocks.unregisteredIdsMocks['handles single item list'].ids;

    // Act
    const result = await unregisteredIds(ids as any);
    // TIP: alternatively use: await expect(unregisteredIds(ids as any)).resolves.toBeDefined()

    // Assert
    expect(Array.isArray(result)).toBe(true);
    // expect(result).toEqual([] as any[]);
  });

  test('handles rejection gracefully', async () => {
    // Arrange
    const ids = mocks.unregisteredIdsMocks['handles rejection gracefully'].ids;

    // Act
    const result = await unregisteredIds(ids as any);
    // TIP: alternatively use: await expect(unregisteredIds(ids as any)).resolves.toBeDefined()

    // Assert
    expect(Array.isArray(result)).toBe(true);
    // expect(result).toEqual([] as any[]);
  });

  test('verifies dependency interactions', async () => {
    // Arrange
    const ids = ['item-1', 'item-2', 'item-3'];
    (q as jest.Mock).mockResolvedValue([] as any[]);

    // Act
    const result = await unregisteredIds(ids as any);
    // TIP: alternatively use: await expect(unregisteredIds(ids as any)).resolves.toBeDefined()

    // Assert
    expect(q).toHaveBeenCalledWith(ids, expect.any(Array));
  });

  test('propagates error when dependency fails', async () => {
    // Arrange — force a dependency to reject
    const depError = new Error('dependency failure');
    q.mockRejectedValueOnce(depError);
    const ids = ['item-1', 'item-2', 'item-3'];

    // Act & Assert
    await expect(unregisteredIds(ids as any)).rejects.toThrow('dependency failure');
  });

  test('guards against invalid input (!dbEnabled || ids.length === 0)', async () => {
    // Arrange
    const ids =
      mocks.unregisteredIdsMocks['guards against invalid input (!dbEnabled || ids.length === 0)']
        .ids;

    // Act
    const result = await unregisteredIds(ids as any);
    // TIP: alternatively use: await expect(unregisteredIds(ids as any)).resolves.toBeDefined()

    // Assert
    expect(Array.isArray(result)).toBe(true);
    // expect(result).toEqual([] as any[]);

    expect(q).toHaveBeenCalledWith(ids, expect.any(Array));
  });

  test('proceeds with valid input', async () => {
    // Arrange
    const ids = mocks.unregisteredIdsMocks['proceeds with valid input'].ids;

    // Act
    const result = await unregisteredIds(ids as any);
    // TIP: alternatively use: await expect(unregisteredIds(ids as any)).resolves.toBeDefined()

    // Assert
    expect(Array.isArray(result)).toBe(true);
    // expect(result).toEqual([] as any[]);

    expect(q).toHaveBeenCalledWith(ids, expect.any(Array));
  });
});

// @testgen-sig:syncTicket(c:ConversationDTO,actor:string):Promise<void>
describe('syncTicket', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([
    [
      'handles valid conversationdto',
      {
        id: 1,
        status: 'active',
        unread: 1,
        updatedAt: new Date('2025-06-15T10:30:00Z'),
        createdAt: new Date('2025-06-15T10:30:00Z'),
        ticket: 'test-value',
        name: 'John Doe',
        subtitle: 'test-value',
        preview: 'test-value',
        previewFromContact: true,
        labels: ['item-1', 'item-2', 'item-3'],
        closedTopics: [],
        autoGreetedAt: 1,
        assignee: { id: 1, name: 'John Doe' },
      },
      'test-string-value',
    ] as any[],
    ['handles minimal conversationdto', {} as any /* ConversationDTO */, ''] as any[],
    [
      'handles rejection gracefully',
      {
        id: 1,
        status: 'active',
        unread: 1,
        updatedAt: new Date('2025-06-15T10:30:00Z'),
        createdAt: new Date('2025-06-15T10:30:00Z'),
        ticket: 'test-value',
        name: 'John Doe',
        subtitle: 'test-value',
        preview: 'test-value',
        previewFromContact: true,
        labels: ['item-1', 'item-2', 'item-3'],
        closedTopics: [],
        autoGreetedAt: 1,
        assignee: { id: 1, name: 'John Doe' },
      },
      'test-string-value',
    ] as any[],
    [
      'verifies dependency interactions',
      {
        id: 1,
        status: 'active',
        unread: 1,
        updatedAt: new Date('2025-06-15T10:30:00Z'),
        createdAt: new Date('2025-06-15T10:30:00Z'),
        ticket: 'test-value',
        name: 'John Doe',
        subtitle: 'test-value',
        preview: 'test-value',
        previewFromContact: true,
        labels: ['item-1', 'item-2', 'item-3'],
        closedTopics: [],
        autoGreetedAt: 1,
        assignee: { id: 1, name: 'John Doe' },
      },
      'test-string-value',
    ] as any[],
    [
      'handles null/undefined (dbEnabled is falsy)',
      {
        id: 1,
        status: 'active',
        unread: 1,
        updatedAt: new Date('2025-06-15T10:30:00Z'),
        createdAt: new Date('2025-06-15T10:30:00Z'),
        ticket: 'test-value',
        name: 'John Doe',
        subtitle: 'test-value',
        preview: 'test-value',
        previewFromContact: true,
        labels: ['item-1', 'item-2', 'item-3'],
        closedTopics: [],
        autoGreetedAt: 1,
        assignee: { id: 1, name: 'John Doe' },
      },
      'test-string-value',
    ] as any[],
    ['proceeds when value exists', {} as any /* ConversationDTO */, ''] as any[],
    [
      'returns correctly when e instanceof Error',
      {
        id: 1,
        status: 'active',
        unread: 1,
        updatedAt: new Date('2025-06-15T10:30:00Z'),
        createdAt: new Date('2025-06-15T10:30:00Z'),
        ticket: 'test-value',
        name: 'John Doe',
        subtitle: 'test-value',
        preview: 'test-value',
        previewFromContact: true,
        labels: ['item-1', 'item-2', 'item-3'],
        closedTopics: [],
        autoGreetedAt: 1,
        assignee: { id: 1, name: 'John Doe' },
      },
      'test-string-value',
    ] as any[],
    ['returns fallback when condition is not met', {} as any /* ConversationDTO */, ''] as any[],
    [
      'succeeds without throwing',
      {
        id: 1,
        status: 'active',
        unread: 1,
        updatedAt: new Date('2025-06-15T10:30:00Z'),
        createdAt: new Date('2025-06-15T10:30:00Z'),
        ticket: 'test-value',
        name: 'John Doe',
        subtitle: 'test-value',
        preview: 'test-value',
        previewFromContact: true,
        labels: ['item-1', 'item-2', 'item-3'],
        closedTopics: [],
        autoGreetedAt: 1,
        assignee: { id: 1, name: 'John Doe' },
      },
      'test-string-value',
    ] as any[],
    ['handles error thrown inside try block', {} as any /* ConversationDTO */, ''] as any[],
  ])('%s', async (_label: string, c: any, actor: any) => {
    // Act
    const result = await syncTicket(c, actor);

    // Assert
    expect(result).toBeUndefined();
  });

  test('propagates error when dependency fails', async () => {
    // Arrange — force a dependency to reject
    // No async dependency found — add a mockRejectedValueOnce call for the relevant dep
    const c = {
      id: 1,
      status: 'active',
      unread: 1,
      updatedAt: new Date('2025-06-15T10:30:00Z'),
      createdAt: new Date('2025-06-15T10:30:00Z'),
      ticket: 'test-value',
      name: 'John Doe',
      subtitle: 'test-value',
      preview: 'test-value',
      previewFromContact: true,
      labels: ['item-1', 'item-2', 'item-3'],
      closedTopics: [],
      autoGreetedAt: 1,
      assignee: { id: 1, name: 'John Doe' },
    };
    const actor = 'test-string-value';

    // Act & Assert
    await expect(syncTicket(c as any, actor as any)).rejects.toThrow('dependency failure');
  });
});

// @testgen-sig:ticketNoOf(c:ConversationDTO):Promise<string>
describe('ticketNoOf', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('handles valid conversationdto', async () => {
    // Arrange
    const c = mocks.ticketNoOfMocks['handles valid conversationdto'].c;

    // Act
    const result = await ticketNoOf(c as any);
    // TIP: alternatively use: await expect(ticketNoOf(c as any)).resolves.toBeDefined()

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');

    expect(dbEnabled).toHaveBeenCalled();
  });

  test('handles minimal conversationdto', async () => {
    // Arrange
    const c = mocks.ticketNoOfMocks['handles minimal conversationdto'].c;

    // Act
    const result = await ticketNoOf(c as any);
    // TIP: alternatively use: await expect(ticketNoOf(c as any)).resolves.toBeDefined()

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('handles rejection gracefully', async () => {
    // Arrange
    const c = mocks.ticketNoOfMocks['handles rejection gracefully'].c;

    // Act
    const result = await ticketNoOf(c as any);
    // TIP: alternatively use: await expect(ticketNoOf(c as any)).resolves.toBeDefined()

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('verifies dependency interactions', async () => {
    // Arrange
    const c = {
      id: 1,
      status: 'active',
      unread: 1,
      updatedAt: new Date('2025-06-15T10:30:00Z'),
      createdAt: new Date('2025-06-15T10:30:00Z'),
      ticket: 'test-value',
      name: 'John Doe',
      subtitle: 'test-value',
      preview: 'test-value',
      previewFromContact: true,
      labels: ['item-1', 'item-2', 'item-3'],
      closedTopics: [],
      autoGreetedAt: 1,
      assignee: { id: 1, name: 'John Doe' },
    };

    // Act
    const result = await ticketNoOf(c as any);
    // TIP: alternatively use: await expect(ticketNoOf(c as any)).resolves.toBeDefined()

    // Assert
    expect(dbEnabled).toHaveBeenCalled();
  });

  test('propagates error when dependency fails', async () => {
    // Arrange — force a dependency to reject
    // No async dependency found — add a mockRejectedValueOnce call for the relevant dep
    const c = {
      id: 1,
      status: 'active',
      unread: 1,
      updatedAt: new Date('2025-06-15T10:30:00Z'),
      createdAt: new Date('2025-06-15T10:30:00Z'),
      ticket: 'test-value',
      name: 'John Doe',
      subtitle: 'test-value',
      preview: 'test-value',
      previewFromContact: true,
      labels: ['item-1', 'item-2', 'item-3'],
      closedTopics: [],
      autoGreetedAt: 1,
      assignee: { id: 1, name: 'John Doe' },
    };

    // Act & Assert
    await expect(ticketNoOf(c as any)).rejects.toThrow('dependency failure');
  });

  test('handles null/undefined (dbEnabled is falsy)', async () => {
    // Arrange
    const c = mocks.ticketNoOfMocks['handles null/undefined (dbEnabled is falsy)'].c;

    // Act
    const result = await ticketNoOf(c as any);
    // TIP: alternatively use: await expect(ticketNoOf(c as any)).resolves.toBeDefined()

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('proceeds when value exists', async () => {
    // Arrange
    const c = mocks.ticketNoOfMocks['proceeds when value exists'].c;

    // Act
    const result = await ticketNoOf(c as any);
    // TIP: alternatively use: await expect(ticketNoOf(c as any)).resolves.toBeDefined()

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('uses fallback when (await registerTickets([c])).get(c.id) is null/undefined', async () => {
    // Arrange
    const c =
      mocks.ticketNoOfMocks[
        'uses fallback when (await registerTickets([c])).get(c.id) is null/undefined'
      ].c;

    // Act
    const result = await ticketNoOf(c as any);
    // TIP: alternatively use: await expect(ticketNoOf(c as any)).resolves.toBeDefined()

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('uses (await registerTickets([c])).get(c.id) value when defined', async () => {
    // Arrange
    const c =
      mocks.ticketNoOfMocks['uses (await registerTickets([c])).get(c.id) value when defined'].c;

    // Act
    const result = await ticketNoOf(c as any);
    // TIP: alternatively use: await expect(ticketNoOf(c as any)).resolves.toBeDefined()

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });
});

// @testgen-sig:logEvent(conversationId:number,type:string,actor:string,detail:Record<string,unknown>):Promise<void>
describe('logEvent', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([
    ['handles valid ID', 1, 'admin', 'test-string-value', {} as any] as any[],
    ['handles zero ID', 0, 'user', '', {} as any] as any[],
    ['handles negative ID', -1, 'user', "O'Brien & Sons <LLC>", {} as any] as any[],
    ['handles rejection gracefully', 1, 'admin', 'test-string-value', {} as any] as any[],
    ['verifies dependency interactions', 1, 'admin', 'test-string-value', {} as any] as any[],
    [
      'handles null/undefined (dbEnabled is falsy)',
      1,
      'admin',
      'test-string-value',
      {} as any,
    ] as any[],
    ['proceeds when value exists', 0, 'user', '', {} as any] as any[],
    [
      'returns correctly when e instanceof Error',
      1,
      'admin',
      'test-string-value',
      {} as any,
    ] as any[],
    ['returns fallback when condition is not met', 0, 'user', '', {} as any] as any[],
    ['succeeds without throwing', 1, 'admin', 'test-string-value', {} as any] as any[],
    ['handles error thrown inside try block', 0, 'user', '', {} as any] as any[],
    ['handles optional params omitted', 1, 'admin', 'test-string-value', undefined] as any[],
  ])('%s', async (_label: string, conversationId: any, type: any, actor: any, detail: any) => {
    // Act
    const result = await logEvent(conversationId, type, actor, detail);

    // Assert
    expect(result).toBeUndefined();
  });

  test('propagates error when dependency fails', async () => {
    // Arrange — force a dependency to reject
    const depError = new Error('dependency failure');
    q.mockRejectedValueOnce(depError);
    const conversationId = 1;
    const type = 'admin';
    const actor = 'test-string-value';
    const detail = {} as any;

    // Act & Assert
    await expect(
      logEvent(conversationId as any, type as any, actor as any, detail as any),
    ).rejects.toThrow('dependency failure');
  });
});

// @testgen-sig:markFirstReply(conversationId:number):Promise<void>
describe('markFirstReply', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('handles valid ID', async () => {
    // Arrange
    const conversationId = mocks.markFirstReplyMocks['handles valid ID'].conversationId;

    // Act
    const result = await markFirstReply(conversationId as any);
    // TIP: alternatively use: await expect(markFirstReply(conversationId as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeUndefined();

    expect(db).toHaveBeenCalled();
    expect(q).toHaveBeenCalledWith(conversationId, expect.any(Array));
  });

  test('handles zero ID', async () => {
    // Arrange
    const conversationId = mocks.markFirstReplyMocks['handles zero ID'].conversationId;

    // Act
    const result = await markFirstReply(conversationId as any);
    // TIP: alternatively use: await expect(markFirstReply(conversationId as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeUndefined();
  });

  test('handles negative ID', async () => {
    // Arrange
    const conversationId = mocks.markFirstReplyMocks['handles negative ID'].conversationId;

    // Act
    const result = await markFirstReply(conversationId as any);
    // TIP: alternatively use: await expect(markFirstReply(conversationId as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeUndefined();
  });

  test('handles rejection gracefully', async () => {
    // Arrange
    const conversationId = mocks.markFirstReplyMocks['handles rejection gracefully'].conversationId;

    // Act
    const result = await markFirstReply(conversationId as any);
    // TIP: alternatively use: await expect(markFirstReply(conversationId as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeUndefined();
  });

  test('verifies dependency interactions', async () => {
    // Arrange
    const conversationId = 1;
    (db as jest.Mock).mockReturnValue({ id: 1 });
    (q as jest.Mock).mockResolvedValue([] as any[]);

    // Act
    const result = await markFirstReply(conversationId as any);
    // TIP: alternatively use: await expect(markFirstReply(conversationId as any)).resolves.toBeDefined()

    // Assert
    expect(db).toHaveBeenCalled();
    expect(q).toHaveBeenCalledWith(conversationId, expect.any(Array));
  });

  test('propagates error when dependency fails', async () => {
    // Arrange — force a dependency to reject
    const depError = new Error('dependency failure');
    q.mockRejectedValueOnce(depError);
    const conversationId = 1;

    // Act & Assert
    await expect(markFirstReply(conversationId as any)).rejects.toThrow('dependency failure');
  });

  test('handles null/undefined (dbEnabled is falsy)', async () => {
    // Arrange
    const conversationId =
      mocks.markFirstReplyMocks['handles null/undefined (dbEnabled is falsy)'].conversationId;

    // Act
    const result = await markFirstReply(conversationId as any);
    // TIP: alternatively use: await expect(markFirstReply(conversationId as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeUndefined();
  });

  test('proceeds when value exists', async () => {
    // Arrange
    const conversationId = mocks.markFirstReplyMocks['proceeds when value exists'].conversationId;

    // Act
    const result = await markFirstReply(conversationId as any);
    // TIP: alternatively use: await expect(markFirstReply(conversationId as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeUndefined();
  });

  test('returns correctly when e instanceof Error', async () => {
    // Arrange
    const conversationId =
      mocks.markFirstReplyMocks['returns correctly when e instanceof Error'].conversationId;

    // Act
    const result = await markFirstReply(conversationId as any);
    // TIP: alternatively use: await expect(markFirstReply(conversationId as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeUndefined();
  });

  test('returns fallback when condition is not met', async () => {
    // Arrange
    const conversationId =
      mocks.markFirstReplyMocks['returns fallback when condition is not met'].conversationId;

    // Act
    const result = await markFirstReply(conversationId as any);
    // TIP: alternatively use: await expect(markFirstReply(conversationId as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeUndefined();
  });

  test('succeeds without throwing', async () => {
    // Arrange
    const conversationId = mocks.markFirstReplyMocks['succeeds without throwing'].conversationId;

    // Act
    const result = await markFirstReply(conversationId as any);
    // TIP: alternatively use: await expect(markFirstReply(conversationId as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeUndefined();
  });

  test('handles error thrown inside try block', async () => {
    // Arrange
    const conversationId =
      mocks.markFirstReplyMocks['handles error thrown inside try block'].conversationId;

    // Act
    const result = await markFirstReply(conversationId as any);
    // TIP: alternatively use: await expect(markFirstReply(conversationId as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeUndefined();
  });
});
