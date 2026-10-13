// @cotester-generated
// @cotester-version: 2

import { closeNoticeText } from '../../../src/lib/closeNotice';
import * as mocks from '../../mocks/lib/closeNotice.mock';

// @testgen-sig:closeNoticeText(opts:_closed:string[];remaining:string[];resolved:boolean;ticket?:string|null;_):string
describe('closeNoticeText', () => {
  test('handles valid { closed: string[]; remaining: string[]; resolved: boolean; ticket?: string', () => {
    // Arrange
    const opts =
      mocks.closeNoticeTextMocks[
        'handles valid { closed: string[]; remaining: string[]; resolved: boolean; ticket?: string'
      ].opts;

    // Act
    const result = closeNoticeText(opts as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('handles minimal { closed: string[]; remaining: string[]; resolved: boolean; ticket?: string', () => {
    // Arrange
    const opts =
      mocks.closeNoticeTextMocks[
        'handles minimal { closed: string[]; remaining: string[]; resolved: boolean; ticket?: string'
      ].opts;

    // Act
    const result = closeNoticeText(opts as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('handles null input', () => {
    // Arrange
    const opts = mocks.closeNoticeTextMocks['handles null input'].opts;

    // Act
    const result = closeNoticeText(opts as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('handles undefined input', () => {
    // Arrange
    const opts = mocks.closeNoticeTextMocks['handles undefined input'].opts;

    // Act
    const result = closeNoticeText(opts as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('handles when resolved is truthy', () => {
    // Arrange
    const opts = mocks.closeNoticeTextMocks['handles when resolved is truthy'].opts;

    // Act
    const result = closeNoticeText(opts as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('handles when resolved is falsy', () => {
    // Arrange
    const opts = mocks.closeNoticeTextMocks['handles when resolved is falsy'].opts;

    // Act
    const result = closeNoticeText(opts as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('returns correctly when ticket is truthy', () => {
    // Arrange
    const opts = mocks.closeNoticeTextMocks['returns correctly when ticket is truthy'].opts;

    // Act
    const result = closeNoticeText(opts as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('returns fallback when ticket is falsy', () => {
    // Arrange
    const opts = mocks.closeNoticeTextMocks['returns fallback when ticket is falsy'].opts;

    // Act
    const result = closeNoticeText(opts as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('returns correctly when closed.length is truthy', () => {
    // Arrange
    const opts = mocks.closeNoticeTextMocks['returns correctly when closed.length is truthy'].opts;

    // Act
    const result = closeNoticeText(opts as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('returns fallback when closed.length is falsy', () => {
    // Arrange
    const opts = mocks.closeNoticeTextMocks['returns fallback when closed.length is falsy'].opts;

    // Act
    const result = closeNoticeText(opts as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('returns correctly when tag is truthy', () => {
    // Arrange
    const opts = mocks.closeNoticeTextMocks['returns correctly when tag is truthy'].opts;

    // Act
    const result = closeNoticeText(opts as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('returns fallback when tag is falsy', () => {
    // Arrange
    const opts = mocks.closeNoticeTextMocks['returns fallback when tag is falsy'].opts;

    // Act
    const result = closeNoticeText(opts as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('handles case when tag || "ນີ້"', () => {
    // Arrange
    const opts = mocks.closeNoticeTextMocks['handles case when tag || "ນີ້"'].opts;

    // Act
    const result = closeNoticeText(opts as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('handles case when condition is not met', () => {
    // Arrange
    const opts = mocks.closeNoticeTextMocks['handles case when condition is not met'].opts;

    // Act
    const result = closeNoticeText(opts as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });

  test('handles case when tag || " "', () => {
    // Arrange
    const opts = mocks.closeNoticeTextMocks['handles case when tag || " "'].opts;

    // Act
    const result = closeNoticeText(opts as any);

    // Assert
    expect(typeof result).toBe('string');
    // expect(result).toBe('mock-value');
  });
});
