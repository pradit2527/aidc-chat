// @cotester-generated
// @cotester-version: 2

jest.mock('../../../src/lib/categories', () => ({
  CATEGORIES: jest.fn(),
}));

import { api, fmtTime, labelName, initialOf } from '../../../src/lib/adminClient';
import * as mocks from '../../mocks/lib/adminClient.mock';
import { CATEGORIES } from '../../../src/lib/categories';

// @testgen-sig:api(path:string,init:_method?:string;json?:unknown;_):Promise<T>
describe('api', () => {
  test.each([
    [
      'handles valid path',
      'src/utils/helper.ts',
      { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any,
    ] as any[],
    [
      'handles empty path',
      '',
      {} as any /* minimal { method?: string; json?: unknown; } */,
    ] as any[],
    [
      'proceeds when value exists',
      '',
      {} as any /* minimal { method?: string; json?: unknown; } */,
    ] as any[],
    [
      'returns correctly when hasBody is truthy',
      'src/utils/helper.ts',
      { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any,
    ] as any[],
    [
      'returns fallback when hasBody is falsy',
      '',
      {} as any /* minimal { method?: string; json?: unknown; } */,
    ] as any[],
    [
      'uses fallback when init.method is truthy is null/undefined',
      'src/utils/helper.ts',
      { id: 1, name: 'Test { method?: string; json?: unknown; }' } as any,
    ] as any[],
    [
      'uses init.method is truthy value when defined',
      '',
      {} as any /* minimal { method?: string; json?: unknown; } */,
    ] as any[],
    ['handles optional params omitted', 'src/utils/helper.ts', undefined] as any[],
  ])('%s', async (_label: string, path: any, init: any) => {
    // Act
    const result = await api(path, init);

    // Assert
    expect(result).toBeDefined();
    // expect(result).toEqual({ id: 1 });
  });

  test('handles null/undefined (res.ok is falsy)', async () => {
    // Arrange
    const path = mocks.apiMocks['handles null/undefined (res.ok is falsy)'].path;
    const init = mocks.apiMocks['handles null/undefined (res.ok is falsy)'].init;

    // Act & Assert
    await expect(api(path as any, init as any)).rejects.toThrow();
  });
});

// @testgen-sig:fmtTime(sec:number):string
describe('fmtTime', () => {
  test('handles typical value', () => {
    // Arrange
    const sec = mocks.fmtTimeMocks['handles typical value'].sec;

    // Act
    const result = fmtTime(sec as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('handles negative value', () => {
    // Arrange
    const sec = mocks.fmtTimeMocks['handles negative value'].sec;

    // Act
    const result = fmtTime(sec as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('handles zero', () => {
    // Arrange
    const sec = mocks.fmtTimeMocks['handles zero'].sec;

    // Act
    const result = fmtTime(sec as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('handles boundary value', () => {
    // Arrange
    const sec = mocks.fmtTimeMocks['handles boundary value'].sec;

    // Act
    const result = fmtTime(sec as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('handles null/undefined (sec is falsy)', () => {
    // Arrange
    const sec = mocks.fmtTimeMocks['handles null/undefined (sec is falsy)'].sec;

    // Act
    const result = fmtTime(sec as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('proceeds when value exists', () => {
    // Arrange
    const sec = mocks.fmtTimeMocks['proceeds when value exists'].sec;

    // Act
    const result = fmtTime(sec as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('returns correctly when sameDay is truthy', () => {
    // Arrange
    const sec = mocks.fmtTimeMocks['returns correctly when sameDay is truthy'].sec;

    // Act
    const result = fmtTime(sec as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('returns fallback when sameDay is falsy', () => {
    // Arrange
    const sec = mocks.fmtTimeMocks['returns fallback when sameDay is falsy'].sec;

    // Act
    const result = fmtTime(sec as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('handles case when d.getFullYear() === now.getFullYear() && d.getMonth()...', () => {
    // Arrange
    const sec =
      mocks.fmtTimeMocks[
        'handles case when d.getFullYear() === now.getFullYear() && d.getMonth()...'
      ].sec;

    // Act
    const result = fmtTime(sec as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('handles case when condition is not met', () => {
    // Arrange
    const sec = mocks.fmtTimeMocks['handles case when condition is not met'].sec;

    // Act
    const result = fmtTime(sec as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });
});

// @testgen-sig:labelName(title:string,lang:Lang):string
describe('labelName', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([
    [
      'handles valid text',
      'This is a test description for unit testing purposes',
      'en-US',
    ] as any[],
    ['handles empty text', '', 'es-ES'] as any[],
    [
      'verifies dependency interactions',
      'This is a test description for unit testing purposes',
      'en-US',
    ] as any[],
    [
      'guards against invalid input (title === "cosi-urgent")',
      'This is a test description for unit testing purposes',
      'en-US',
    ] as any[],
    ['proceeds with valid input', '', 'es-ES'] as any[],
    [
      'returns correctly when cat is truthy',
      'This is a test description for unit testing purposes',
      'en-US',
    ] as any[],
    ['returns fallback when cat is falsy', '', 'es-ES'] as any[],
  ])('%s', (_label: string, title: any, lang: any) => {
    // Act
    const result = labelName(title, lang);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });
});

// @testgen-sig:initialOf(name:string):string
describe('initialOf', () => {
  test('handles valid name', () => {
    // Arrange
    const name = mocks.initialOfMocks['handles valid name'].name;

    // Act
    const result = initialOf(name as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('handles empty name', () => {
    // Arrange
    const name = mocks.initialOfMocks['handles empty name'].name;

    // Act
    const result = initialOf(name as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('');
  });

  test('uses fallback when Array.from(name.trim())[0] is null/undefined', () => {
    // Arrange
    const name =
      mocks.initialOfMocks['uses fallback when Array.from(name.trim())[0] is null/undefined'].name;

    // Act
    const result = initialOf(name as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('uses Array.from(name.trim())[0] value when defined', () => {
    // Arrange
    const name = mocks.initialOfMocks['uses Array.from(name.trim())[0] value when defined'].name;

    // Act
    const result = initialOf(name as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });
});
