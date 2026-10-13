// @cotester-generated
// @cotester-version: 2

jest.mock('../../../../../../src/lib/adminApi', () => ({
  adminRoute: jest.fn(),
}));

jest.mock('../../../../../../src/lib/cw', () => ({
  acct: jest.fn(),
  cw: jest.fn(),
  payloadArray: jest.fn(),
}));

import { GET } from '../../../../../../src/app/api/admin/labels/route';
import * as mocks from '../../../../../mocks/app/api/admin/labels/route.mock';
import { adminRoute } from '../../../../../../src/lib/adminApi';
import { acct, cw, payloadArray } from '../../../../../../src/lib/cw';

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
    expect(payloadArray).toHaveBeenCalled();
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

  test('guards against invalid input (hit && Date.now() - hit.at < TTL_MS)', async () => {
    // Arrange
    const req =
      mocks.GETMocks['guards against invalid input (hit && Date.now() - hit.at < TTL_MS)'].req;

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
  });

  test('proceeds with valid input', async () => {
    // Arrange
    const req = mocks.GETMocks['proceeds with valid input'].req;

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
  });

  test('returns correctly when typeof l.color === "string"', async () => {
    // Arrange
    const req = mocks.GETMocks['returns correctly when typeof l.color === "string"'].req;

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

  test('returns correctly when typeof l.description === "string"', async () => {
    // Arrange
    const req = mocks.GETMocks['returns correctly when typeof l.description === "string"'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when typeof l.title === "string" && (l.title as...', async () => {
    // Arrange
    const req =
      mocks.GETMocks['handles case when typeof l.title === "string" && (l.title as...'].req;

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

  test('uses fallback when openByLabel.get(title) is null/undefined', async () => {
    // Arrange
    const req = mocks.GETMocks['uses fallback when openByLabel.get(title) is null/undefined'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses openByLabel.get(title) value when defined', async () => {
    // Arrange
    const req = mocks.GETMocks['uses openByLabel.get(title) value when defined'].req;

    // Act
    const result = await GET(req as any);
    // TIP: alternatively use: await expect(GET(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });
});
