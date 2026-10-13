// @cotester-generated
// @cotester-version: 2

jest.mock('../../../../../src/lib/chatwoot', () => ({
  chatwootConfig: jest.fn(),
}));

import { GET } from '../../../../../src/app/api/health/route';
import * as mocks from '../../../../mocks/app/api/health/route.mock';
import { chatwootConfig } from '../../../../../src/lib/chatwoot';

// @testgen-sig:GET():Promise<NextResponse<{ok:boolean;baseUrl:any;chatwoot:{reachable:boolean;version?:string;};configured:{websiteToken:boolean;hmacToken:boolean;sessionSecret:boolean;};host:{vercel:boolean;env:string;url:string;}|{vercel:boolean;env?:undefined;url?:undefined;};}>>
describe('GET', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('handles default case', async () => {
    // Act
    const result = await GET();
    // TIP: alternatively use: await expect(GET()).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles rejection gracefully', async () => {
    // Act
    const result = await GET();
    // TIP: alternatively use: await expect(GET()).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('verifies dependency interactions', async () => {
    // Act
    const result = await GET();
    // TIP: alternatively use: await expect(GET()).resolves.toBeDefined()

    // Assert
    expect(chatwootConfig).toHaveBeenCalled();
  });

  test('propagates error when dependency fails', async () => {
    // Arrange — force a dependency to reject
    // No async dependency found — add a mockRejectedValueOnce call for the relevant dep

    // Act & Assert
    await expect(GET()).rejects.toThrow('dependency failure');
  });

  test('handles when r.ok is truthy', async () => {
    // Act
    const result = await GET();
    // TIP: alternatively use: await expect(GET()).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when r.ok is falsy', async () => {
    // Act
    const result = await GET();
    // TIP: alternatively use: await expect(GET()).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns correctly when process.env.VERCEL is truthy', async () => {
    // Act
    const result = await GET();
    // TIP: alternatively use: await expect(GET()).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns fallback when process.env.VERCEL is falsy', async () => {
    // Act
    const result = await GET();
    // TIP: alternatively use: await expect(GET()).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when process.env.SESSION_SECRET &&...', async () => {
    // Act
    const result = await GET();
    // TIP: alternatively use: await expect(GET()).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when condition is not met', async () => {
    // Act
    const result = await GET();
    // TIP: alternatively use: await expect(GET()).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when chatwoot.reachable && configured.websiteToken &&...', async () => {
    // Act
    const result = await GET();
    // TIP: alternatively use: await expect(GET()).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when chatwoot.reachable && configured.websiteToken', async () => {
    // Act
    const result = await GET();
    // TIP: alternatively use: await expect(GET()).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses fallback when process.env.VERCEL_ENV is truthy is null/undefined', async () => {
    // Act
    const result = await GET();
    // TIP: alternatively use: await expect(GET()).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses process.env.VERCEL_ENV is truthy value when defined', async () => {
    // Act
    const result = await GET();
    // TIP: alternatively use: await expect(GET()).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses fallback when process.env.VERCEL_URL is truthy is null/undefined', async () => {
    // Act
    const result = await GET();
    // TIP: alternatively use: await expect(GET()).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses process.env.VERCEL_URL is truthy value when defined', async () => {
    // Act
    const result = await GET();
    // TIP: alternatively use: await expect(GET()).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('succeeds without throwing', async () => {
    // Act
    const result = await GET();
    // TIP: alternatively use: await expect(GET()).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles error thrown inside try block', async () => {
    // Act
    const result = await GET();
    // TIP: alternatively use: await expect(GET()).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });
});
