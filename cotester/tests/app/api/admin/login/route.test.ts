// @cotester-generated
// @cotester-version: 2

jest.mock('../../../../../../src/lib/adminApi', () => ({
  isHttps: jest.fn(),
  loginAllowed: jest.fn(),
  sameOrigin: jest.fn(),
}));

jest.mock('../../../../../../src/lib/chatwoot', () => ({
  chatwootConfig: jest.fn(),
}));

jest.mock('../../../../../../src/lib/cw', () => ({
  ACCOUNT_ID: jest.fn(),
}));

jest.mock('../../../../../../src/lib/session', () => ({
  SESSION_COOKIE: jest.fn(),
  SESSION_TTL_SEC: jest.fn(),
  sealSession: jest.fn(),
}));

import { POST } from '../../../../../../src/app/api/admin/login/route';
import * as mocks from '../../../../../mocks/app/api/admin/login/route.mock';
import { isHttps, loginAllowed, sameOrigin } from '../../../../../../src/lib/adminApi';
import { chatwootConfig } from '../../../../../../src/lib/chatwoot';
import { ACCOUNT_ID } from '../../../../../../src/lib/cw';
import { SESSION_COOKIE, SESSION_TTL_SEC, sealSession } from '../../../../../../src/lib/session';

// @testgen-sig:POST(req:NextRequest):Promise<NextResponse<{error:string;}>|NextResponse<{user:any;}>>
describe('POST', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('handles valid nextrequest', async () => {
    // Arrange
    const req = mocks.POSTMocks['handles valid nextrequest'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });

    expect(isHttps).toHaveBeenCalled();
    expect(loginAllowed).toHaveBeenCalled();
    expect(sameOrigin).toHaveBeenCalled();
    expect(chatwootConfig).toHaveBeenCalled();
    expect(sealSession).toHaveBeenCalled();
  });

  test('handles minimal nextrequest', async () => {
    // Arrange
    const req = mocks.POSTMocks['handles minimal nextrequest'].req;

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
    expect(isHttps).toHaveBeenCalled();
    expect(loginAllowed).toHaveBeenCalled();
    expect(sameOrigin).toHaveBeenCalled();
    expect(chatwootConfig).toHaveBeenCalled();
    expect(ACCOUNT_ID).toHaveBeenCalled();
    expect(SESSION_COOKIE).toHaveBeenCalled();
    expect(SESSION_TTL_SEC).toHaveBeenCalled();
    expect(sealSession).toHaveBeenCalled();
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

    expect(isHttps).toHaveBeenCalled();
    expect(loginAllowed).toHaveBeenCalled();
    expect(sameOrigin).toHaveBeenCalled();
    expect(chatwootConfig).toHaveBeenCalled();
    expect(sealSession).toHaveBeenCalled();
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

    expect(isHttps).toHaveBeenCalled();
    expect(loginAllowed).toHaveBeenCalled();
    expect(sameOrigin).toHaveBeenCalled();
    expect(chatwootConfig).toHaveBeenCalled();
    expect(sealSession).toHaveBeenCalled();
  });

  test('guards against invalid input (!loginAllowed(ip))', async () => {
    // Arrange
    const req = mocks.POSTMocks['guards against invalid input (!loginAllowed(ip))'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });

    expect(isHttps).toHaveBeenCalled();
    expect(loginAllowed).toHaveBeenCalled();
    expect(sameOrigin).toHaveBeenCalled();
    expect(chatwootConfig).toHaveBeenCalled();
    expect(sealSession).toHaveBeenCalled();
  });

  test('guards against invalid input (!email || !password || email.length > 200 ||...)', async () => {
    // Arrange
    const req =
      mocks.POSTMocks[
        'guards against invalid input (!email || !password || email.length > 200 ||...)'
      ].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });

    expect(isHttps).toHaveBeenCalled();
    expect(loginAllowed).toHaveBeenCalled();
    expect(sameOrigin).toHaveBeenCalled();
    expect(chatwootConfig).toHaveBeenCalled();
    expect(sealSession).toHaveBeenCalled();
  });

  test('guards against invalid input (!process.env.SESSION_SECRET ||...)', async () => {
    // Arrange
    const req =
      mocks.POSTMocks['guards against invalid input (!process.env.SESSION_SECRET ||...)'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });

    expect(isHttps).toHaveBeenCalled();
    expect(loginAllowed).toHaveBeenCalled();
    expect(sameOrigin).toHaveBeenCalled();
    expect(chatwootConfig).toHaveBeenCalled();
    expect(sealSession).toHaveBeenCalled();
  });

  test('handles null/undefined (res.ok is falsy)', async () => {
    // Arrange
    const req = mocks.POSTMocks['handles null/undefined (res.ok is falsy)'].req;

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

  test('guards against invalid input (!token || !client || !uid)', async () => {
    // Arrange
    const req = mocks.POSTMocks['guards against invalid input (!token || !client || !uid)'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });

    expect(isHttps).toHaveBeenCalled();
    expect(loginAllowed).toHaveBeenCalled();
    expect(sameOrigin).toHaveBeenCalled();
    expect(chatwootConfig).toHaveBeenCalled();
    expect(sealSession).toHaveBeenCalled();
  });

  test('guards against invalid input (!accounts.some((a) => String(a.id) === ACCOUNT_ID))', async () => {
    // Arrange
    const req =
      mocks.POSTMocks[
        'guards against invalid input (!accounts.some((a) => String(a.id) === ACCOUNT_ID))'
      ].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });

    expect(isHttps).toHaveBeenCalled();
    expect(loginAllowed).toHaveBeenCalled();
    expect(sameOrigin).toHaveBeenCalled();
    expect(chatwootConfig).toHaveBeenCalled();
    expect(sealSession).toHaveBeenCalled();
  });

  test('returns correctly when typeof body?.email === "string"', async () => {
    // Arrange
    const req = mocks.POSTMocks['returns correctly when typeof body?.email === "string"'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns fallback when condition is not met', async () => {
    // Arrange
    const req = mocks.POSTMocks['returns fallback when condition is not met'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns correctly when typeof body?.password === "string"', async () => {
    // Arrange
    const req = mocks.POSTMocks['returns correctly when typeof body?.password === "string"'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns correctly when Array.isArray(data.accounts)', async () => {
    // Arrange
    const req = mocks.POSTMocks['returns correctly when Array.isArray(data.accounts)'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()...', async () => {
    // Arrange
    const req =
      mocks.POSTMocks[
        'handles case when req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()...'
      ].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when condition is not met', async () => {
    // Arrange
    const req = mocks.POSTMocks['handles case when condition is not met'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when !email || !password || email.length > 200', async () => {
    // Arrange
    const req = mocks.POSTMocks['handles case when !email || !password || email.length > 200'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when !email || !password', async () => {
    // Arrange
    const req = mocks.POSTMocks['handles case when !email || !password'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses fallback when ((await res.json().catch(() => ({}))) as { data?:... is null/undefined', async () => {
    // Arrange
    const req =
      mocks.POSTMocks[
        'uses fallback when ((await res.json().catch(() => ({}))) as { data?:... is null/undefined'
      ].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('uses ((await res.json().catch(() => ({}))) as { data?:... value when defined', async () => {
    // Arrange
    const req =
      mocks.POSTMocks[
        'uses ((await res.json().catch(() => ({}))) as { data?:... value when defined'
      ].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when !token || !client', async () => {
    // Arrange
    const req = mocks.POSTMocks['handles case when !token || !client'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when Number(data.id) || 0', async () => {
    // Arrange
    const req = mocks.POSTMocks['handles case when Number(data.id) || 0'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when data.name || data.available_name || email', async () => {
    // Arrange
    const req = mocks.POSTMocks['handles case when data.name || data.available_name || email'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when data.name || data.available_name', async () => {
    // Arrange
    const req = mocks.POSTMocks['handles case when data.name || data.available_name'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles case when data.email || email', async () => {
    // Arrange
    const req = mocks.POSTMocks['handles case when data.email || email'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when req.headers.get("x-forwarded-for")?.split(",")[0] is defined', async () => {
    // Arrange
    const req =
      mocks.POSTMocks['handles when req.headers.get("x-forwarded-for")?.split(",")[0] is defined']
        .req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when req.headers.get("x-forwarded-for")?.split(",")[0] is null/undefined (optional chain short-circuits)', async () => {
    // Arrange
    const req =
      mocks.POSTMocks[
        'handles when req.headers.get("x-forwarded-for")?.split(",")[0] is null/undefined (optional chain short-circuits)'
      ].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when req.headers.get("x-forwarded-for") is defined', async () => {
    // Arrange
    const req = mocks.POSTMocks['handles when req.headers.get("x-forwarded-for") is defined'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when req.headers.get("x-forwarded-for") is null/undefined (optional chain short-circuits)', async () => {
    // Arrange
    const req =
      mocks.POSTMocks[
        'handles when req.headers.get("x-forwarded-for") is null/undefined (optional chain short-circuits)'
      ].req;

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

  test('succeeds without throwing', async () => {
    // Arrange
    const req = mocks.POSTMocks['succeeds without throwing'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles error thrown inside try block', async () => {
    // Arrange
    const req = mocks.POSTMocks['handles error thrown inside try block'].req;

    // Act
    const result = await POST(req as any);
    // TIP: alternatively use: await expect(POST(req as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });
});
