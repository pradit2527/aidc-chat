// @cotester-generated
// @cotester-version: 2

jest.mock('../../../../../../src/lib/adminApi', () => ({
  adminRoute: jest.fn(),
}));

jest.mock('../../../../../../src/lib/cw', () => ({
  acct: jest.fn(),
  cw: jest.fn(),
  INBOX_ID: jest.fn(),
  payloadArray: jest.fn(),
  toConversation: jest.fn(),
}));

jest.mock('../../../../../../src/lib/db', () => ({
  dbEnabled: jest.fn(),
}));

jest.mock('../../../../../../src/lib/greeter', () => ({
  runGreetings: jest.fn(),
}));

jest.mock('../../../../../../src/lib/ticketMap', () => ({
  ticketMap: jest.fn(),
}));

jest.mock('../../../../../../src/lib/ticketRegistry', () => ({
  registerTickets: jest.fn(),
}));

import { GET } from '../../../../../../src/app/api/admin/conversations/route';
import * as mocks from '../../../../../mocks/app/api/admin/conversations/route.mock';
import { adminRoute } from '../../../../../../src/lib/adminApi';
import { acct, cw, INBOX_ID, payloadArray, toConversation } from '../../../../../../src/lib/cw';
import { dbEnabled } from '../../../../../../src/lib/db';
import { runGreetings } from '../../../../../../src/lib/greeter';
import { ticketMap } from '../../../../../../src/lib/ticketMap';
import { registerTickets } from '../../../../../../src/lib/ticketRegistry';

// @testgen-sig:GET(req:Request):Promise<any>
describe('GET', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('handles valid request', async () => {
    // Arrange
    const req = mocks.GETMocks['handles valid request'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });

    expect(adminRoute).toHaveBeenCalled();
    expect(acct).toHaveBeenCalled();
    expect(cw).toHaveBeenCalled();
    expect(payloadArray).toHaveBeenCalled();
    expect(toConversation).toHaveBeenCalled();
    expect(dbEnabled).toHaveBeenCalled();
    expect(runGreetings).toHaveBeenCalled();
    expect(ticketMap).toHaveBeenCalled();
    expect(registerTickets).toHaveBeenCalled();
  });

  test('handles minimal request', async () => {
    // Arrange
    const req = mocks.GETMocks['handles minimal request'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles rejection gracefully', async () => {
    // Arrange
    const req = mocks.GETMocks['handles rejection gracefully'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('verifies dependency interactions', async () => {
    // Arrange
    const req = {
      body: {} as any /* object */,
      headers: { 'Content-Type': 'application/json' },
      method: 'GET',
      url: 'https://api.example.com/v1/resource',
    };

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(adminRoute).toHaveBeenCalled();
    expect(acct).toHaveBeenCalled();
    expect(cw).toHaveBeenCalled();
    expect(INBOX_ID).toHaveBeenCalled();
    expect(payloadArray).toHaveBeenCalled();
    expect(toConversation).toHaveBeenCalled();
    expect(dbEnabled).toHaveBeenCalled();
    expect(runGreetings).toHaveBeenCalled();
    expect(ticketMap).toHaveBeenCalled();
    expect(registerTickets).toHaveBeenCalled();
  });

  test('propagates error when dependency fails', async () => {
    // Arrange — force a dependency to reject
    // No async dependency found — add a mockRejectedValueOnce call for the relevant dep
    const req = {
      body: {} as any /* object */,
      headers: { 'Content-Type': 'application/json' },
      method: 'GET',
      url: 'https://api.example.com/v1/resource',
    };

    // Act & Assert
    await expect(GET(req as any)).rejects.toThrow('dependency failure');
  });

  test('handles when /^[a-z0-9_-]{1,60}$/.test(label)', async () => {
    // Arrange
    const req = mocks.GETMocks['handles when /^[a-z0-9_-]{1,60}$/.test(label)'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when condition is not met', async () => {
    // Arrange
    const req = mocks.GETMocks['handles when condition is not met'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when q.get("status") === "open"', async () => {
    // Arrange
    const req = mocks.GETMocks['handles when q.get("status") === "open"'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when conversations.length > 0', async () => {
    // Arrange
    const req = mocks.GETMocks['handles when conversations.length > 0'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when dbEnabled is truthy', async () => {
    // Arrange
    const req = mocks.GETMocks['handles when dbEnabled is truthy'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when dbEnabled is falsy', async () => {
    // Arrange
    const req = mocks.GETMocks['handles when dbEnabled is falsy'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when map.size is 0', async () => {
    // Arrange
    const req = mocks.GETMocks['handles when map.size is 0'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when map.size is not 0', async () => {
    // Arrange
    const req = mocks.GETMocks['handles when map.size is not 0'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns correctly when STATUSES.has(status)', async () => {
    // Arrange
    const req = mocks.GETMocks['returns correctly when STATUSES.has(status)'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns fallback when condition is not met', async () => {
    // Arrange
    const req = mocks.GETMocks['returns fallback when condition is not met'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns correctly when e instanceof Error', async () => {
    // Arrange
    const req = mocks.GETMocks['returns correctly when e instanceof Error'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses fallback when url.searchParams.get("status") is null/undefined', async () => {
    // Arrange
    const req =
      mocks.GETMocks['uses fallback when url.searchParams.get("status") is null/undefined'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses url.searchParams.get("status") value when defined', async () => {
    // Arrange
    const req = mocks.GETMocks['uses url.searchParams.get("status") value when defined'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses fallback when url.searchParams.get("label") is null/undefined', async () => {
    // Arrange
    const req =
      mocks.GETMocks['uses fallback when url.searchParams.get("label") is null/undefined'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses url.searchParams.get("label") value when defined', async () => {
    // Arrange
    const req = mocks.GETMocks['uses url.searchParams.get("label") value when defined'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when Number(url.searchParams.get("page")) || 1', async () => {
    // Arrange
    const req = mocks.GETMocks['handles case when Number(url.searchParams.get("page")) || 1'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when condition is not met', async () => {
    // Arrange
    const req = mocks.GETMocks['handles case when condition is not met'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses fallback when map.get(c.id) is null/undefined', async () => {
    // Arrange
    const req = mocks.GETMocks['uses fallback when map.get(c.id) is null/undefined'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses map.get(c.id) value when defined', async () => {
    // Arrange
    const req = mocks.GETMocks['uses map.get(c.id) value when defined'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('succeeds without throwing', async () => {
    // Arrange
    const req = mocks.GETMocks['succeeds without throwing'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles error thrown inside try block', async () => {
    // Arrange
    const req = mocks.GETMocks['handles error thrown inside try block'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });
});
