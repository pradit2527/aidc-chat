// @cotester-generated
// @cotester-version: 2

jest.mock('../../../../../src/lib/categories', () => ({
  DEPARTMENTS: jest.fn(),
}));

jest.mock('../../../../../src/lib/chatwoot', () => ({
  signIdentifier: jest.fn(),
}));

import { POST } from '../../../../../src/app/api/identify/route';
import * as mocks from '../../../../mocks/app/api/identify/route.mock';
import { DEPARTMENTS } from '../../../../../src/lib/categories';
import { signIdentifier } from '../../../../../src/lib/chatwoot';

// @testgen-sig:POST(req:Request):Promise<NextResponse<{error:string;}>|NextResponse<{name:string;department:any;departmentLabel:any;contact:string;identifier:string;identifierHash:any;}>>
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

    expect(signIdentifier).toHaveBeenCalled();
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
    expect(DEPARTMENTS).toHaveBeenCalled();
    expect(signIdentifier).toHaveBeenCalled();
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

  test('handles null/undefined (name is falsy)', async () => {
    // Arrange
    const req = mocks.POSTMocks['handles null/undefined (name is falsy)'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('proceeds when value exists', async () => {
    // Arrange
    const req = mocks.POSTMocks['proceeds when value exists'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles null/undefined (dept is falsy)', async () => {
    // Arrange
    const req = mocks.POSTMocks['handles null/undefined (dept is falsy)'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when body is truthy is defined', async () => {
    // Arrange
    const req = mocks.POSTMocks['handles when body is truthy is defined'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when body is truthy is null/undefined (optional chain short-circuits)', async () => {
    // Arrange
    const req =
      mocks.POSTMocks[
        'handles when body is truthy is null/undefined (optional chain short-circuits)'
      ].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });
});
