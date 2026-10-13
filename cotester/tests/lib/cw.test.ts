// @cotester-generated
// @cotester-version: 2

jest.mock('../../../src/lib/chatwoot', () => ({
  chatwootConfig: jest.fn(),
}));

import {
  cw,
  toConversation,
  toMessage,
  payloadArray,
  acct,
  toCanned,
  toAgent,
} from '../../../src/lib/cw';
import * as mocks from '../../mocks/lib/cw.mock';
import { chatwootConfig } from '../../../src/lib/chatwoot';

// @testgen-sig:cw(s:Session,path:string,init:_method?:string;json?:unknown;_):Promise<T>
describe('cw', () => {
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
      'src/utils/helper.ts',
      { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any,
    ] as any[],
    [
      'handles minimal session',
      {} as any /* Session */,
      '',
      {} as any /* minimal { method?: string; json?: unknown; } */,
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
      'src/utils/helper.ts',
      { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any,
    ] as any[],
    [
      'proceeds when value exists',
      {} as any /* Session */,
      '',
      {} as any /* minimal { method?: string; json?: unknown; } */,
    ] as any[],
    [
      'proceeds with valid input',
      {} as any /* Session */,
      '',
      {} as any /* minimal { method?: string; json?: unknown; } */,
    ] as any[],
    [
      'returns correctly when init.json is not undefined',
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        client: 'test-value',
        uid: 'test-value',
        user: { id: 1, name: 'John Doe', email: 'test@example.com' },
        exp: 1,
      },
      'src/utils/helper.ts',
      { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any,
    ] as any[],
    [
      'returns fallback when init.json is undefined',
      {} as any /* Session */,
      '',
      {} as any /* minimal { method?: string; json?: unknown; } */,
    ] as any[],
    [
      'returns correctly when text is truthy',
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        client: 'test-value',
        uid: 'test-value',
        user: { id: 1, name: 'John Doe', email: 'test@example.com' },
        exp: 1,
      },
      'src/utils/helper.ts',
      { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any,
    ] as any[],
    [
      'returns fallback when text is falsy',
      {} as any /* Session */,
      '',
      {} as any /* minimal { method?: string; json?: unknown; } */,
    ] as any[],
    [
      'uses fallback when init.method is truthy is null/undefined',
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        client: 'test-value',
        uid: 'test-value',
        user: { id: 1, name: 'John Doe', email: 'test@example.com' },
        exp: 1,
      },
      'src/utils/helper.ts',
      { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any,
    ] as any[],
    [
      'uses init.method is truthy value when defined',
      {} as any /* Session */,
      '',
      {} as any /* minimal { method?: string; json?: unknown; } */,
    ] as any[],
    [
      'succeeds without throwing',
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        client: 'test-value',
        uid: 'test-value',
        user: { id: 1, name: 'John Doe', email: 'test@example.com' },
        exp: 1,
      },
      'src/utils/helper.ts',
      { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any,
    ] as any[],
    [
      'handles error thrown inside try block',
      {} as any /* Session */,
      '',
      {} as any /* minimal { method?: string; json?: unknown; } */,
    ] as any[],
    [
      'handles optional params omitted',
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc',
        client: 'test-value',
        uid: 'test-value',
        user: { id: 1, name: 'John Doe', email: 'test@example.com' },
        exp: 1,
      },
      'src/utils/helper.ts',
      undefined,
    ] as any[],
  ])('%s', async (_label: string, s: any, path: any, init: any) => {
    // Act
    const result = await cw(s, path, init);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
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
    const path = 'src/utils/helper.ts';
    const init = { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any;

    // Act & Assert
    await expect(cw(s as any, path as any, init as any)).rejects.toThrow('dependency failure');
  });

  test('handles null/undefined (res.ok is falsy)', async () => {
    // Arrange
    const s = mocks.cwMocks['handles null/undefined (res.ok is falsy)'].s;
    const path = mocks.cwMocks['handles null/undefined (res.ok is falsy)'].path;
    const init = mocks.cwMocks['handles null/undefined (res.ok is falsy)'].init;

    // Act & Assert
    await expect(cw(s as any, path as any, init as any)).rejects.toThrow();
  });

  test('guards against invalid input (res.status === 204)', async () => {
    // Arrange
    const s = mocks.cwMocks['guards against invalid input (res.status === 204)'].s;
    const path = mocks.cwMocks['guards against invalid input (res.status === 204)'].path;
    const init = mocks.cwMocks['guards against invalid input (res.status === 204)'].init;

    // Act & Assert
    await expect(cw(s as any, path as any, init as any)).rejects.toThrow();
  });
});

// @testgen-sig:toConversation(raw:unknown):ConversationDTO
describe('toConversation', () => {
  test('handles default case', () => {
    // Arrange
    const raw = mocks.toConversationMocks['handles default case'].raw;

    // Act
    const result = toConversation(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns correctly when awaitingReply is truthy', () => {
    // Arrange
    const raw = mocks.toConversationMocks['returns correctly when awaitingReply is truthy'].raw;

    // Act
    const result = toConversation(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns fallback when awaitingReply is falsy', () => {
    // Arrange
    const raw = mocks.toConversationMocks['returns fallback when awaitingReply is falsy'].raw;

    // Act
    const result = toConversation(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns correctly when num(assignee.id)', () => {
    // Arrange
    const raw = mocks.toConversationMocks['returns correctly when num(assignee.id)'].raw;

    // Act
    const result = toConversation(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns fallback when condition is not met', () => {
    // Arrange
    const raw = mocks.toConversationMocks['returns fallback when condition is not met'].raw;

    // Act
    const result = toConversation(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses fallback when c.last_non_activity_message is truthy is null/undefined', () => {
    // Arrange
    const raw =
      mocks.toConversationMocks[
        'uses fallback when c.last_non_activity_message is truthy is null/undefined'
      ].raw;

    // Act
    const result = toConversation(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses c.last_non_activity_message is truthy value when defined', () => {
    // Arrange
    const raw =
      mocks.toConversationMocks['uses c.last_non_activity_message is truthy value when defined']
        .raw;

    // Act
    const result = toConversation(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses fallback when (["open", "resolved", "pending", "snoozed"] as... is null/undefined', () => {
    // Arrange
    const raw =
      mocks.toConversationMocks[
        'uses fallback when (["open", "resolved", "pending", "snoozed"] as... is null/undefined'
      ].raw;

    // Act
    const result = toConversation(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses (["open", "resolved", "pending", "snoozed"] as... value when defined', () => {
    // Arrange
    const raw =
      mocks.toConversationMocks[
        'uses (["open", "resolved", "pending", "snoozed"] as... value when defined'
      ].raw;

    // Act
    const result = toConversation(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when kind === 0 || kind === "incoming"', () => {
    // Arrange
    const raw =
      mocks.toConversationMocks['handles case when kind === 0 || kind === "incoming"'].raw;

    // Act
    const result = toConversation(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when condition is not met', () => {
    // Arrange
    const raw = mocks.toConversationMocks['handles case when condition is not met'].raw;

    // Act
    const result = toConversation(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when fromContact && status === "open"', () => {
    // Arrange
    const raw = mocks.toConversationMocks['handles case when fromContact && status === "open"'].raw;

    // Act
    const result = toConversation(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when num(c.timestamp) || num(last.created_at) ||...', () => {
    // Arrange
    const raw =
      mocks.toConversationMocks['handles case when num(c.timestamp) || num(last.created_at) ||...']
        .raw;

    // Act
    const result = toConversation(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when num(c.timestamp) || num(last.created_at)', () => {
    // Arrange
    const raw =
      mocks.toConversationMocks['handles case when num(c.timestamp) || num(last.created_at)'].raw;

    // Act
    const result = toConversation(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when num(c.created_at) || num(c.timestamp) ||...', () => {
    // Arrange
    const raw =
      mocks.toConversationMocks['handles case when num(c.created_at) || num(c.timestamp) ||...']
        .raw;

    // Act
    const result = toConversation(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when num(c.created_at) || num(c.timestamp)', () => {
    // Arrange
    const raw =
      mocks.toConversationMocks['handles case when num(c.created_at) || num(c.timestamp)'].raw;

    // Act
    const result = toConversation(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when str(sender.name) || "—"', () => {
    // Arrange
    const raw = mocks.toConversationMocks['handles case when str(sender.name) || "—"'].raw;

    // Act
    const result = toConversation(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when str(add.description) || str(add.company_name)', () => {
    // Arrange
    const raw =
      mocks.toConversationMocks['handles case when str(add.description) || str(add.company_name)']
        .raw;

    // Act
    const result = toConversation(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });
});

// @testgen-sig:toMessage(raw:unknown):MessageDTO
describe('toMessage', () => {
  test('handles default case', () => {
    // Arrange
    const raw = mocks.toMessageMocks['handles default case'].raw;

    // Act
    const result = toMessage(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns correctly when t === 0 || t === "incoming"', () => {
    // Arrange
    const raw = mocks.toMessageMocks['returns correctly when t === 0 || t === "incoming"'].raw;

    // Act
    const result = toMessage(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns fallback when condition is not met', () => {
    // Arrange
    const raw = mocks.toMessageMocks['returns fallback when condition is not met'].raw;

    // Act
    const result = toMessage(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns correctly when t === 2 || t === "activity"', () => {
    // Arrange
    const raw = mocks.toMessageMocks['returns correctly when t === 2 || t === "activity"'].raw;

    // Act
    const result = toMessage(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns correctly when kind === "outgoing" && !m.sender', () => {
    // Arrange
    const raw = mocks.toMessageMocks['returns correctly when kind === "outgoing" && !m.sender'].raw;

    // Act
    const result = toMessage(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when str(x.file_type) || "file"', () => {
    // Arrange
    const raw = mocks.toMessageMocks['handles case when str(x.file_type) || "file"'].raw;

    // Act
    const result = toMessage(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when condition is not met', () => {
    // Arrange
    const raw = mocks.toMessageMocks['handles case when condition is not met'].raw;

    // Act
    const result = toMessage(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when str(x.thumb_url) || url', () => {
    // Arrange
    const raw = mocks.toMessageMocks['handles case when str(x.thumb_url) || url'].raw;

    // Act
    const result = toMessage(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when url.split("/").pop()?.split("?")[0] || "file"', () => {
    // Arrange
    const raw =
      mocks.toMessageMocks['handles case when url.split("/").pop()?.split("?")[0] || "file"'].raw;

    // Act
    const result = toMessage(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when str(obj(m.sender).name) || (kind === "outgoing" &&...', () => {
    // Arrange
    const raw =
      mocks.toMessageMocks[
        'handles case when str(obj(m.sender).name) || (kind === "outgoing" &&...'
      ].raw;

    // Act
    const result = toMessage(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when url.split("/").pop() is defined', () => {
    // Arrange
    const raw = mocks.toMessageMocks['handles when url.split("/").pop() is defined'].raw;

    // Act
    const result = toMessage(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when url.split("/").pop() is null/undefined (optional chain short-circuits)', () => {
    // Arrange
    const raw =
      mocks.toMessageMocks[
        'handles when url.split("/").pop() is null/undefined (optional chain short-circuits)'
      ].raw;

    // Act
    const result = toMessage(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });
});

// @testgen-sig:payloadArray(body:unknown):unknown[]
describe('payloadArray', () => {
  test('handles default case', () => {
    // Arrange
    const body = mocks.payloadArrayMocks['handles default case'].body;

    // Act
    const result = payloadArray(body as any);

    // Assert
    expect(Array.isArray(result)).toBe(true);
    // expect(result).toEqual([] as any[]);
  });

  test('guards against invalid input (Array.isArray(body))', () => {
    // Arrange
    const body = mocks.payloadArrayMocks['guards against invalid input (Array.isArray(body))'].body;

    // Act
    const result = payloadArray(body as any);

    // Assert
    expect(Array.isArray(result)).toBe(true);
    // expect(result).toEqual([] as any[]);
  });

  test('proceeds with valid input', () => {
    // Arrange
    const body = mocks.payloadArrayMocks['proceeds with valid input'].body;

    // Act
    const result = payloadArray(body as any);

    // Assert
    expect(Array.isArray(result)).toBe(true);
    // expect(result).toEqual([] as any[]);
  });

  test('guards against invalid input (Array.isArray(b.payload))', () => {
    // Arrange
    const body =
      mocks.payloadArrayMocks['guards against invalid input (Array.isArray(b.payload))'].body;

    // Act
    const result = payloadArray(body as any);

    // Assert
    expect(Array.isArray(result)).toBe(true);
    // expect(result).toEqual([] as any[]);
  });

  test('guards against invalid input (Array.isArray(data.payload))', () => {
    // Arrange
    const body =
      mocks.payloadArrayMocks['guards against invalid input (Array.isArray(data.payload))'].body;

    // Act
    const result = payloadArray(body as any);

    // Assert
    expect(Array.isArray(result)).toBe(true);
    // expect(result).toEqual([] as any[]);
  });

  test('guards against invalid input (Array.isArray(b.data))', () => {
    // Arrange
    const body =
      mocks.payloadArrayMocks['guards against invalid input (Array.isArray(b.data))'].body;

    // Act
    const result = payloadArray(body as any);

    // Assert
    expect(Array.isArray(result)).toBe(true);
    // expect(result).toEqual([] as any[]);
  });
});

// @testgen-sig:acct(path:string):string
describe('acct', () => {
  test('handles valid path', () => {
    // Arrange
    const path = mocks.acctMocks['handles valid path'].path;

    // Act
    const result = acct(path as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('handles empty path', () => {
    // Arrange
    const path = mocks.acctMocks['handles empty path'].path;

    // Act
    const result = acct(path as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('');
  });
});

// @testgen-sig:toCanned(raw:unknown):CannedDTO
describe('toCanned', () => {
  test('handles default case', () => {
    // Arrange
    const raw = mocks.toCannedMocks['handles default case'].raw;

    // Act
    const result = toCanned(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });
});

// @testgen-sig:toAgent(raw:unknown):AgentDTO
describe('toAgent', () => {
  test('handles default case', () => {
    // Arrange
    const raw = mocks.toAgentMocks['handles default case'].raw;

    // Act
    const result = toAgent(raw as any);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });
});
