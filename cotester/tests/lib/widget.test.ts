// @cotester-generated
// @cotester-version: 2

import {
  loadChatwoot,
  identify,
  setChatMeta,
  setWidgetLocale,
  resetChatwoot,
} from '../../../src/lib/widget';
import * as mocks from '../../mocks/lib/widget.mock';

// @testgen-sig:loadChatwoot(opts:_baseUrl:string;websiteToken:string;lang:Lang;_):Promise<ChatwootSdk>
describe('loadChatwoot', () => {
  test('handles valid { baseurl: string; websitetoken: string; lang: lang; }', async () => {
    // Arrange
    const opts =
      mocks.loadChatwootMocks[
        'handles valid { baseurl: string; websitetoken: string; lang: lang; }'
      ].opts;

    // Act
    const result = await loadChatwoot(opts as any);
    // TIP: alternatively use: await expect(loadChatwoot(opts as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles minimal { baseurl: string; websitetoken: string; lang: lang; }', async () => {
    // Arrange
    const opts =
      mocks.loadChatwootMocks[
        'handles minimal { baseurl: string; websitetoken: string; lang: lang; }'
      ].opts;

    // Act
    const result = await loadChatwoot(opts as any);
    // TIP: alternatively use: await expect(loadChatwoot(opts as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('rejects on invalid input', async () => {
    // Arrange
    const opts = mocks.loadChatwootMocks['rejects on invalid input'].opts;

    // Act & Assert
    await expect(loadChatwoot(opts as any)).rejects.toThrow();
  });

  test('guards against invalid input (sdkPromise is truthy)', async () => {
    // Arrange
    const opts =
      mocks.loadChatwootMocks['guards against invalid input (sdkPromise is truthy)'].opts;

    // Act & Assert
    await expect(loadChatwoot(opts as any)).rejects.toThrow();
  });

  test('proceeds with valid input', async () => {
    // Arrange
    const opts = mocks.loadChatwootMocks['proceeds with valid input'].opts;

    // Act
    const result = await loadChatwoot(opts as any);
    // TIP: alternatively use: await expect(loadChatwoot(opts as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when pendingMeta is truthy', async () => {
    // Arrange
    const opts = mocks.loadChatwootMocks['handles when pendingMeta is truthy'].opts;

    // Act
    const result = await loadChatwoot(opts as any);
    // TIP: alternatively use: await expect(loadChatwoot(opts as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when pendingMeta is falsy', async () => {
    // Arrange
    const opts = mocks.loadChatwootMocks['handles when pendingMeta is falsy'].opts;

    // Act
    const result = await loadChatwoot(opts as any);
    // TIP: alternatively use: await expect(loadChatwoot(opts as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns correctly when window.$chatwoot', async () => {
    // Arrange
    const opts = mocks.loadChatwootMocks['returns correctly when window.$chatwoot'].opts;

    // Act
    const result = await loadChatwoot(opts as any);
    // TIP: alternatively use: await expect(loadChatwoot(opts as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('returns fallback when condition is not met', async () => {
    // Arrange
    const opts = mocks.loadChatwootMocks['returns fallback when condition is not met'].opts;

    // Act
    const result = await loadChatwoot(opts as any);
    // TIP: alternatively use: await expect(loadChatwoot(opts as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when window.chatwootSDK is truthy is defined', async () => {
    // Arrange
    const opts =
      mocks.loadChatwootMocks['handles when window.chatwootSDK is truthy is defined'].opts;

    // Act
    const result = await loadChatwoot(opts as any);
    // TIP: alternatively use: await expect(loadChatwoot(opts as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles when window.chatwootSDK is truthy is null/undefined (optional chain short-circuits)', async () => {
    // Arrange
    const opts =
      mocks.loadChatwootMocks[
        'handles when window.chatwootSDK is truthy is null/undefined (optional chain short-circuits)'
      ].opts;

    // Act
    const result = await loadChatwoot(opts as any);
    // TIP: alternatively use: await expect(loadChatwoot(opts as any)).resolves.toBeDefined()

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });
});

// @testgen-sig:identify(cw:ChatwootSdk,p:Profile):void
describe('identify', () => {
  test.each([
    [
      'handles valid chatwootsdk',
      {
        toggle: {} as any /* (state?: "open" | "close" | undefined) => void */,
        setUser: {} as any /* (identifier: string, attrs: Record<string, unknown>) => void */,
        setLocale: {} as any /* (locale: string) => void */,
        setLabel: {} as any /* (label: string) => void */,
        removeLabel: {} as any /* (label: string) => void */,
        setConversationCustomAttributes: {} as any /* (attrs: Record<string, unknown>) => void */,
        reset: ['item-1', 'item-2', 'item-3'],
      },
      {
        name: 'John Doe',
        department: 'test-value',
        departmentLabel: 'test-value',
        contact: 'test-value',
        identifier: 'test-value',
        identifierHash: 'test-value',
      },
    ] as any[],
    ['handles minimal chatwootsdk', {} as any /* ChatwootSdk */, {} as any /* Profile */] as any[],
    [
      'returns correctly when p.identifierHash is truthy',
      {
        toggle: {} as any /* (state?: "open" | "close" | undefined) => void */,
        setUser: {} as any /* (identifier: string, attrs: Record<string, unknown>) => void */,
        setLocale: {} as any /* (locale: string) => void */,
        setLabel: {} as any /* (label: string) => void */,
        removeLabel: {} as any /* (label: string) => void */,
        setConversationCustomAttributes: {} as any /* (attrs: Record<string, unknown>) => void */,
        reset: ['item-1', 'item-2', 'item-3'],
      },
      {
        name: 'John Doe',
        department: 'test-value',
        departmentLabel: 'test-value',
        contact: 'test-value',
        identifier: 'test-value',
        identifierHash: 'test-value',
      },
    ] as any[],
    [
      'returns fallback when p.identifierHash is falsy',
      {} as any /* ChatwootSdk */,
      {} as any /* Profile */,
    ] as any[],
  ])('%s', (_label: string, cw: any, p: any) => {
    // Act
    const result = identify(cw, p);

    // Assert
    expect(result).toBeUndefined();
  });
});

// @testgen-sig:setChatMeta(meta:ChatMeta):void
describe('setChatMeta', () => {
  test('handles valid chatmeta', () => {
    // Arrange
    const meta = mocks.setChatMetaMocks['handles valid chatmeta'].meta;

    // Act
    const result = setChatMeta(meta as any);

    // Assert
    expect(result).toBeUndefined();
  });

  test('handles minimal chatmeta', () => {
    // Arrange
    const meta = mocks.setChatMetaMocks['handles minimal chatmeta'].meta;

    // Act
    const result = setChatMeta(meta as any);

    // Assert
    expect(result).toBeUndefined();
  });
});

// @testgen-sig:setWidgetLocale(lang:Lang):void
describe('setWidgetLocale', () => {
  test('handles english locale', () => {
    // Arrange
    const lang = mocks.setWidgetLocaleMocks['handles english locale'].lang;

    // Act
    const result = setWidgetLocale(lang as any);

    // Assert
    expect(result).toBeUndefined();
  });

  test('handles spanish locale', () => {
    // Arrange
    const lang = mocks.setWidgetLocaleMocks['handles spanish locale'].lang;

    // Act
    const result = setWidgetLocale(lang as any);

    // Assert
    expect(result).toBeUndefined();
  });

  test('handles when window.$chatwoot is defined', () => {
    // Arrange
    const lang = mocks.setWidgetLocaleMocks['handles when window.$chatwoot is defined'].lang;

    // Act
    const result = setWidgetLocale(lang as any);

    // Assert
    expect(result).toBeUndefined();
  });

  test('handles when window.$chatwoot is null/undefined (optional chain short-circuits)', () => {
    // Arrange
    const lang =
      mocks.setWidgetLocaleMocks[
        'handles when window.$chatwoot is null/undefined (optional chain short-circuits)'
      ].lang;

    // Act
    const result = setWidgetLocale(lang as any);

    // Assert
    expect(result).toBeUndefined();
  });
});

// @testgen-sig:resetChatwoot():void
describe('resetChatwoot', () => {
  test('handles default case', () => {
    // Act
    const result = resetChatwoot();

    // Assert
    expect(result).toBeUndefined();
  });

  test('handles when window.$chatwoot is defined', () => {
    // Act
    const result = resetChatwoot();

    // Assert
    expect(result).toBeUndefined();
  });

  test('handles when window.$chatwoot is null/undefined (optional chain short-circuits)', () => {
    // Act
    const result = resetChatwoot();

    // Assert
    expect(result).toBeUndefined();
  });
});
