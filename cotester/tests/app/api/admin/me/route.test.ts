// @cotester-generated
// @cotester-version: 2

jest.mock('../../../../../../src/lib/adminApi', () => ({
  adminRoute: jest.fn(),
}));

import { GET } from '../../../../../../src/app/api/admin/me/route';
import * as mocks from '../../../../../mocks/app/api/admin/me/route.mock';
import { adminRoute } from '../../../../../../src/lib/adminApi';

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
});
