// @cotester-generated
// @cotester-version: 2

jest.mock('../../../../../../src/lib/adminApi', () => ({
  adminRoute: jest.fn(),
}));

jest.mock('../../../../../../src/lib/db', () => ({
  dbEnabled: jest.fn(),
}));

jest.mock('../../../../../../src/lib/stats', () => ({
  getStats: jest.fn(),
}));

import { GET } from '../../../../../../src/app/api/admin/stats/route';
import * as mocks from '../../../../../mocks/app/api/admin/stats/route.mock';
import { adminRoute } from '../../../../../../src/lib/adminApi';
import { dbEnabled } from '../../../../../../src/lib/db';
import { getStats } from '../../../../../../src/lib/stats';

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
    expect(dbEnabled).toHaveBeenCalled();
    expect(getStats).toHaveBeenCalled();
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
    expect(dbEnabled).toHaveBeenCalled();
    expect(getStats).toHaveBeenCalled();
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

  test('handles null/undefined (dbEnabled is falsy)', async () => {
    // Arrange
    const req = mocks.GETMocks['handles null/undefined (dbEnabled is falsy)'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('proceeds when value exists', async () => {
    // Arrange
    const req = mocks.GETMocks['proceeds when value exists'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when Number(new URL(req.url).searchParams.get("days")) || 14', async () => {
    // Arrange
    const req =
      mocks.GETMocks['handles case when Number(new URL(req.url).searchParams.get("days")) || 14']
        .req;

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
});
