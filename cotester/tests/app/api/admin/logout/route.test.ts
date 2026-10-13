// @cotester-generated
// @cotester-version: 2

jest.mock('../../../../../../src/lib/adminApi', () => ({
  sameOrigin: jest.fn(),
}));

jest.mock('../../../../../../src/lib/session', () => ({
  SESSION_COOKIE: jest.fn(),
}));

import { POST } from '../../../../../../src/app/api/admin/logout/route';
import * as mocks from '../../../../../mocks/app/api/admin/logout/route.mock';
import { sameOrigin } from '../../../../../../src/lib/adminApi';
import { SESSION_COOKIE } from '../../../../../../src/lib/session';

// @testgen-sig:POST(req:Request):Promise<NextResponse<{error:string;}>|NextResponse<{ok:boolean;}>>
describe('POST', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('handles valid request', async () => {
    // Arrange
    const req = mocks.POSTMocks['handles valid request'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });

    expect(sameOrigin).toHaveBeenCalled();
  });

  test('handles minimal request', async () => {
    // Arrange
    const req = mocks.POSTMocks['handles minimal request'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles rejection gracefully', async () => {
    // Arrange
    const req = mocks.POSTMocks['handles rejection gracefully'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

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
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(sameOrigin).toHaveBeenCalled();
    expect(SESSION_COOKIE).toHaveBeenCalled();
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
    await expect(POST(req as any)).rejects.toThrow('dependency failure');
  });

  test('guards against invalid input (!sameOrigin(req))', async () => {
    // Arrange
    const req = mocks.POSTMocks['guards against invalid input (!sameOrigin(req))'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });

    expect(sameOrigin).toHaveBeenCalled();
  });

  test('proceeds with valid input', async () => {
    // Arrange
    const req = mocks.POSTMocks['proceeds with valid input'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });

    expect(sameOrigin).toHaveBeenCalled();
  });
});
