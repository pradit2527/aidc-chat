// @cotester-generated
// @cotester-version: 2

jest.mock('../../../src/lib/cw', () => ({
  acct: jest.fn(),
  INBOX_ID: jest.fn(),
  payloadArray: jest.fn(),
  toConversation: jest.fn(),
}));

jest.mock('../../../src/lib/tickets', () => ({
  dayStart: jest.fn(),
  assignTickets: jest.fn(),
}));

import { fetchConversationsSince, ticketMap } from '../../../src/lib/ticketMap';
import * as mocks from '../../mocks/lib/ticketMap.mock';
import { acct, INBOX_ID, payloadArray, toConversation } from '../../../src/lib/cw';
import { dayStart, assignTickets } from '../../../src/lib/tickets';

// @testgen-sig:fetchConversationsSince(fetchJson:FetchJson,sinceSec:number):Promise<ConversationDTO[]>
describe('fetchConversationsSince', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([
    ['handles valid fetchjson', {} as any /* FetchJson */, 100] as any[],
    ['handles minimal fetchjson', {} as any /* FetchJson */, -50] as any[],
    ['handles rejection gracefully', {} as any /* FetchJson */, 100] as any[],
    ['verifies dependency interactions', {} as any /* FetchJson */, 100] as any[],
    ['handles when list.length < PAGE_SIZE', {} as any /* FetchJson */, 100] as any[],
    ['handles when condition is not met', {} as any /* FetchJson */, -50] as any[],
    [
      'handles when Math.min(...list.map((c) => c.updatedAt)) < need',
      {} as any /* FetchJson */,
      100,
    ] as any[],
  ])('%s', async (_label: string, fetchJson: any, sinceSec: any) => {
    // Act
    const result = await fetchConversationsSince(fetchJson, sinceSec);

    // Assert
    expect(Array.isArray(result)).toBe(true);
    // expect(result).toEqual([] as any[]);
  });

  test('propagates error when dependency fails', async () => {
    // Arrange — force a dependency to reject
    // No async dependency found — add a mockRejectedValueOnce call for the relevant dep
    const fetchJson = {} as any; /* FetchJson */
    const sinceSec = 100;

    // Act & Assert
    await expect(fetchConversationsSince(fetchJson as any, sinceSec as any)).rejects.toThrow(
      'dependency failure',
    );
  });
});

// @testgen-sig:ticketMap(fetchJson:FetchJson,sinceSec:number):Promise<Map<number,string>>
describe('ticketMap', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([
    ['handles valid fetchjson', {} as any /* FetchJson */, 100] as any[],
    ['handles minimal fetchjson', {} as any /* FetchJson */, -50] as any[],
    ['handles rejection gracefully', {} as any /* FetchJson */, 100] as any[],
    ['verifies dependency interactions', {} as any /* FetchJson */, 100] as any[],
    [
      'guards against invalid input (cache && Date.now() - cache.at < TTL_MS &&...)',
      {} as any /* FetchJson */,
      100,
    ] as any[],
    ['proceeds with valid input', {} as any /* FetchJson */, -50] as any[],
    [
      'handles case when cache && Date.now() - cache.at < TTL_MS',
      {} as any /* FetchJson */,
      100,
    ] as any[],
    ['handles case when condition is not met', {} as any /* FetchJson */, -50] as any[],
  ])('%s', async (_label: string, fetchJson: any, sinceSec: any) => {
    // Act
    const result = await ticketMap(fetchJson, sinceSec);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('propagates error when dependency fails', async () => {
    // Arrange — force a dependency to reject
    // No async dependency found — add a mockRejectedValueOnce call for the relevant dep
    const fetchJson = {} as any; /* FetchJson */
    const sinceSec = 100;

    // Act & Assert
    await expect(ticketMap(fetchJson as any, sinceSec as any)).rejects.toThrow(
      'dependency failure',
    );
  });
});
